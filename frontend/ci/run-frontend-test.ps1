#!/usr/bin/env pwsh

# フロントエンド全テスト実行スクリプト
# 使用方法: powershell -File "ci/run-frontend-test.ps1"

# エラーが発生した場合スクリプトを停止
$ErrorActionPreference = "Stop"

# 現在のディレクトリを取得
$currentDir = Get-Location

Write-Host "Starting all frontend tests..." -ForegroundColor Cyan

# 依存関係のチェック
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install dependencies." -ForegroundColor Red
        exit 1
    }
}

# ユニットテスト実行
Write-Host "`nRunning unit tests..." -ForegroundColor Cyan
powershell -File "ci/run-frontend-unittest.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Unit tests failed." -ForegroundColor Red
    exit 1
}

# 統合テスト実行
Write-Host "`nRunning integration tests..." -ForegroundColor Cyan
powershell -File "ci/run-frontend-integrationtest.ps1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Integration tests failed." -ForegroundColor Red
    exit 1
}

# 成功メッセージ
Write-Host "`nAll frontend tests completed successfully!" -ForegroundColor Green 