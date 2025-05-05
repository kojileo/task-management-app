#!/usr/bin/env pwsh

# フロントエンドユニットテスト実行スクリプト
# 使用方法: powershell -File "ci/run-frontend-unittest.ps1"

# エラーが発生した場合スクリプトを停止
$ErrorActionPreference = "Stop"

# 現在のディレクトリを取得
$currentDir = Get-Location

Write-Host "Starting frontend unit tests..." -ForegroundColor Cyan

# ユニットテスト実行（src/**/*.test.{ts,tsx} ファイルを対象）
npm run test:coverage -- --testMatch="**/src/**/*.spec.{ts,tsx}"

# 終了コードを確認
if ($LASTEXITCODE -ne 0) {
    Write-Host "Unit tests failed." -ForegroundColor Red
    exit 1
}

Write-Host "Unit tests completed successfully." -ForegroundColor Green
Write-Host "Coverage report available at: coverage/lcov-report/index.html" -ForegroundColor Yellow
