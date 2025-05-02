#!/usr/bin/env pwsh

# フロントエンド統合テスト実行スクリプト
# 使用方法: powershell -File "ci/run-frontend-integrationtest.ps1"

# エラーが発生した場合スクリプトを停止
$ErrorActionPreference = "Stop"

# 現在のディレクトリを取得
$currentDir = Get-Location

Write-Host "Starting frontend integration tests..." -ForegroundColor Cyan

# 統合テスト実行（src/tests/integration ディレクトリ内の .spec.{ts,tsx} ファイルを対象）
npm run test:coverage -- --testMatch="**/src/tests/integration/**/*.spec.{ts,tsx}"

# 終了コードを確認
if ($LASTEXITCODE -ne 0) {
    Write-Host "Integration tests failed." -ForegroundColor Red
    exit 1
}

Write-Host "Integration tests completed successfully." -ForegroundColor Green
Write-Host "Coverage report available at: coverage/lcov-report/index.html" -ForegroundColor Yellow
