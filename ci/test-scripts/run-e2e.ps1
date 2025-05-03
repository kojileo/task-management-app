$ErrorActionPreference = "Stop"
Write-Host "E2Eテスト実行" -ForegroundColor Cyan

# プロジェクトルートディレクトリの設定
$rootDir = $PSScriptRoot
cd ..\..
$rootDir = Get-Location
$e2eDir = Join-Path $rootDir "e2e"

# 依存関係のインストール
Set-Location $e2eDir
Write-Host "E2E依存関係の確認" -ForegroundColor Yellow

# 依存関係インストール
npm install

# Playwrightのテストを実行
Write-Host "E2Eテスト実行中..." -ForegroundColor Yellow
npm test

# テスト結果の確認
$testResult = $LASTEXITCODE
Write-Host "テスト完了（終了コード: $testResult）" -ForegroundColor Cyan

# 結果表示
if ($testResult -ne 0) {
    Write-Host "テストは失敗しました" -ForegroundColor Red
} else {
    Write-Host "テストは成功しました" -ForegroundColor Green
}

# 元のディレクトリに戻る
Set-Location $rootDir

exit $testResult 