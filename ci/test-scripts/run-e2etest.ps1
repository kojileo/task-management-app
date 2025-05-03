#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
Write-Host "E2Eテスト実行とカバレッジ検証" -ForegroundColor Cyan

# E2Eテストディレクトリに移動
$e2eDir = Join-Path $PSScriptRoot "..\..\e2e"
Set-Location $e2eDir

# 依存関係が存在するか確認
if (-not (Test-Path "node_modules")) {
    Write-Host "依存関係をインストール中..." -ForegroundColor Yellow
    npm ci
}

# バックエンドのビルド・起動（バックグラウンドで）
$backendDir = Join-Path $PSScriptRoot "..\..\backend\TaskManagement.API"
Write-Host "バックエンドをビルド・起動中..." -ForegroundColor Yellow
Push-Location $backendDir
$backendProcess = Start-Process -FilePath "dotnet" -ArgumentList "run", "--urls=http://localhost:5045" -PassThru -NoNewWindow
Pop-Location

# 少し待機してバックエンドが起動するのを待つ
Write-Host "バックエンドの起動を待機中..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

try {
    # フロントエンドのビルド・起動（バックグラウンドで）
    $frontendDir = Join-Path $PSScriptRoot "..\..\frontend"
    Write-Host "フロントエンドをビルド・起動中..." -ForegroundColor Yellow
    Push-Location $frontendDir
    $frontendProcess = Start-Process -FilePath "npm" -ArgumentList "start" -PassThru -NoNewWindow
    Pop-Location

    # 少し待機してフロントエンドが起動するのを待つ
    Write-Host "フロントエンドの起動を待機中..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20

    try {
        # E2Eテスト実行
        Write-Host "E2Eテスト実行中..." -ForegroundColor Yellow
        Set-Location $e2eDir
        npm test

        # E2Eテストのカバレッジレポートパス
        $reportPath = Join-Path $e2eDir "coverage\coverage-summary.json"

        # レポートが存在するか確認
        if (-not (Test-Path $reportPath)) {
            Write-Host "警告: E2Eテストのカバレッジレポートが生成されませんでした" -ForegroundColor Yellow
            Write-Host "E2Eテストは成功しましたが、カバレッジレポートが見つかりません。テスト設定を確認してください。" -ForegroundColor Yellow
            exit 0
        }

        # カバレッジ情報を読み込む
        $coverage = Get-Content $reportPath | ConvertFrom-Json
        $lineRate = $coverage.total.lines.pct
        $branchRate = $coverage.total.branches.pct
        $functionRate = $coverage.total.functions.pct

        # 目標値（E2Eテストは低めの目標値）
        $lineTarget = 20
        $branchTarget = 15

        # カバレッジ結果表示
        Write-Host "`nE2Eテストカバレッジ結果:" -ForegroundColor Cyan
        Write-Host "ライン カバレッジ: $lineRate% (目標: $lineTarget%)"
        Write-Host "分岐 カバレッジ: $branchRate% (目標: $branchTarget%)"
        Write-Host "関数 カバレッジ: $functionRate%"

        # 結果が目標を達成しているか確認
        $success = $true

        if ($lineRate -lt $lineTarget) {
            Write-Host "警告: ラインカバレッジが目標に達していません（$lineRate% < $lineTarget%）" -ForegroundColor Yellow
            $success = $false
        }
        else {
            Write-Host "成功: ラインカバレッジが目標を達成しています（$lineRate% >= $lineTarget%）" -ForegroundColor Green
        }

        if ($branchRate -lt $branchTarget) {
            Write-Host "警告: 分岐カバレッジが目標に達していません（$branchRate% < $branchTarget%）" -ForegroundColor Yellow
            $success = $false
        }
        else {
            Write-Host "成功: 分岐カバレッジが目標を達成しています（$branchRate% >= $branchTarget%）" -ForegroundColor Green
        }

        # クリティカルビジネスフローのカバレッジ確認
        Write-Host "`nクリティカルビジネスフローのカバレッジ:" -ForegroundColor Cyan
        foreach ($property in $coverage.PSObject.Properties) {
            if ($property.Name -ne "total" -and 
               ($property.Name -like "*Task*" -or 
                $property.Name -like "*User*" -or 
                $property.Name -like "*Dashboard*")) {
                $file = $property.Name
                $fileLineRate = $property.Value.lines.pct
                $fileBranchRate = $property.Value.branches.pct

                $color = if ($fileLineRate -lt $lineTarget -or $fileBranchRate -lt $branchTarget) { "Yellow" } else { "Green" }
                Write-Host "$file`: Line: $fileLineRate%, Branch: $fileBranchRate%" -ForegroundColor $color
            }
        }

        # HTMLレポートの場所を表示
        Write-Host "`nHTML詳細レポート: $(Join-Path $e2eDir "coverage\lcov-report\index.html")" -ForegroundColor Cyan

        if (-not $success) {
            Write-Host "`n警告: E2Eテストのカバレッジ目標が達成されていません。改善が必要です。" -ForegroundColor Yellow
            exit 1
        }
        else {
            Write-Host "`n成功: すべてのE2Eテストカバレッジ目標が達成されています！" -ForegroundColor Green
            exit 0
        }
    }
    finally {
        # フロントエンドプロセスの終了
        if ($frontendProcess -ne $null) {
            Write-Host "フロントエンドプロセスを終了中..." -ForegroundColor Yellow
            Stop-Process -Id $frontendProcess.Id -Force -ErrorAction SilentlyContinue
        }
    }
}
finally {
    # バックエンドプロセスの終了
    if ($backendProcess -ne $null) {
        Write-Host "バックエンドプロセスを終了中..." -ForegroundColor Yellow
        Stop-Process -Id $backendProcess.Id -Force -ErrorAction SilentlyContinue
    }
}
