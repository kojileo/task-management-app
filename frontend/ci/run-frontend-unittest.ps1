#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
Write-Host "フロントエンド単体テスト実行とカバレッジ検証" -ForegroundColor Cyan

# フロントエンドディレクトリに移動
$frontendDir = Join-Path $PSScriptRoot "..\..\frontend"
Set-Location $frontendDir

# 依存関係が存在するか確認
if (-not (Test-Path "node_modules")) {
    Write-Host "依存関係をインストール中..." -ForegroundColor Yellow
    npm ci
}

# テスト実行とカバレッジ測定
Write-Host "単体テスト実行中..." -ForegroundColor Yellow
npm test -- --coverage --testPathPattern=src/.*\.test\.(ts|tsx)$ --watchAll=false

# カバレッジレポートのパス
$reportPath = Join-Path $frontendDir "coverage\coverage-summary.json"

# レポートが存在するか確認
if (-not (Test-Path $reportPath)) {
    Write-Host "エラー: カバレッジレポートが生成されませんでした" -ForegroundColor Red
    exit 1
}

# カバレッジ情報を読み込む
$coverage = Get-Content $reportPath | ConvertFrom-Json
$lineRate = $coverage.total.lines.pct
$branchRate = $coverage.total.branches.pct
$functionRate = $coverage.total.functions.pct

# 目標値
$lineTarget = 50
$branchTarget = 40

# カバレッジ結果表示
Write-Host "`nフロントエンド単体テストカバレッジ結果:" -ForegroundColor Cyan
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

# カバレッジが低いファイルを表示
Write-Host "`n低カバレッジファイル:" -ForegroundColor Yellow
$lowCoverageFiles = @()
foreach ($property in $coverage.PSObject.Properties) {
    if ($property.Name -ne "total") {
        $file = $property.Name
        $fileLineRate = $property.Value.lines.pct
        $fileBranchRate = $property.Value.branches.pct

        if ($fileLineRate -lt 40 -or $fileBranchRate -lt 30) {
            Write-Host "$file`: Line: $fileLineRate%, Branch: $fileBranchRate%" -ForegroundColor Yellow
            $lowCoverageFiles += $file
        }
    }
}

# HTMLレポートの場所を表示
Write-Host "`nHTML詳細レポート: $(Join-Path $frontendDir "coverage\lcov-report\index.html")" -ForegroundColor Cyan

if (-not $success) {
    Write-Host "`n警告: フロントエンド単体テストのカバレッジ目標が達成されていません。改善が必要です。" -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "`n成功: すべてのフロントエンド単体テストカバレッジ目標が達成されています！" -ForegroundColor Green
    exit 0
}
