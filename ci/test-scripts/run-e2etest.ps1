#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
Write-Host "E2Eテスト実行とカバレッジ検証" -ForegroundColor Cyan

# プロジェクトルートディレクトリの設定
$rootDir = Join-Path $PSScriptRoot "..\..\"
$backendDir = Join-Path $rootDir "backend\TaskManagement.API"
$frontendDir = Join-Path $rootDir "frontend"
$e2eDir = Join-Path $rootDir "e2e"

# CI環境変数設定
$env:CI = "true"

# 依存関係のインストール
Push-Location $e2eDir
Write-Host "E2Eテストの依存関係をインストール中..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    npm ci
    npx playwright install --with-deps chromium
}
Pop-Location

# バックエンドのビルド・起動
Write-Host "バックエンドをビルド・起動中..." -ForegroundColor Yellow
Push-Location $backendDir
dotnet build
$backendProcess = Start-Process -FilePath "dotnet" -ArgumentList "run", "--urls=http://localhost:5045" -PassThru -NoNewWindow
Pop-Location

# 少し待機してバックエンドが起動するのを待つ
Write-Host "バックエンドの起動を待機中..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

try {
    # フロントエンドのビルド・起動
    Write-Host "フロントエンドをビルド・起動中..." -ForegroundColor Yellow
    Push-Location $frontendDir
    
    # package-lock.jsonが存在するか確認
    if (-not (Test-Path "node_modules")) {
        npm ci
    }
    
    # 本番用ビルド
    npm run build
    
    # 起動
    $frontendProcess = Start-Process -FilePath "npm" -ArgumentList "run", "start" -PassThru -NoNewWindow
    Pop-Location

    # 少し待機してフロントエンドが起動するのを待つ
    Write-Host "フロントエンドの起動を待機中..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15

    try {
        # E2Eテスト実行
        Write-Host "E2Eテスト実行中..." -ForegroundColor Yellow
        Set-Location $e2eDir
        
        # テスト実行
        npm test
        $testResult = $LASTEXITCODE

        Write-Host "E2Eテスト完了（終了コード: $testResult）" -ForegroundColor Cyan

        # HTMLレポートの場所を表示
        $reportPath = Join-Path $e2eDir "playwright-report\index.html"
        if (Test-Path $reportPath) {
            Write-Host "`nテスト詳細レポート: $reportPath" -ForegroundColor Cyan
        }

        if ($testResult -ne 0) {
            Write-Host "`n❌ E2Eテストは失敗しました" -ForegroundColor Red
            exit $testResult
        } else {
            Write-Host "`n✅ E2Eテストは成功しました" -ForegroundColor Green
            exit 0
        }
    }
    finally {
        # フロントエンドプロセスの終了
        if ($null -ne $frontendProcess) {
            Write-Host "フロントエンドプロセスを終了中..." -ForegroundColor Yellow
            Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
        }
    }
}
finally {
    # バックエンドプロセスの終了
    if ($null -ne $backendProcess) {
        Write-Host "バックエンドプロセスを終了中..." -ForegroundColor Yellow
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
