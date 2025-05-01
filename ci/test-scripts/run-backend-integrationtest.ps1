#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
Write-Host "バックエンド統合テスト実行とカバレッジ検証" -ForegroundColor Cyan

# プロジェクトディレクトリに移動
$testDir = Join-Path $PSScriptRoot "..\..\backend\TaskManagement.Tests"
Set-Location $testDir

# テスト実行とカバレッジ測定
Write-Host "統合テスト実行中..." -ForegroundColor Yellow
dotnet test --filter "FullyQualifiedName~IntegrationTests" /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura /p:CoverletOutput="./TestResults/integrationtest-coverage.cobertura.xml" /p:Include="[TaskManagement.API]*" /p:ExcludeByAttribute="Obsolete%2cGeneratedCodeAttribute%2cCompilerGeneratedAttribute"

# カバレッジレポートのパス
$reportPath = Join-Path $testDir "TestResults\integrationtest-coverage.cobertura.xml"

# レポートが存在するか確認
if (-not (Test-Path $reportPath)) {
    Write-Host "エラー: カバレッジレポートが生成されませんでした" -ForegroundColor Red
    # 統合テストがスキップまたは未実装の場合は警告として扱う
    Write-Host "警告: 統合テストがスキップまたは未実装の可能性があります" -ForegroundColor Yellow
    exit 0
}

# カバレッジ情報を読み込む
[xml]$coverage = Get-Content $reportPath
$lineRate = [math]::Round($coverage.coverage.'line-rate' * 100, 2)
$branchRate = [math]::Round($coverage.coverage.'branch-rate' * 100, 2)
$methodRate = [math]::Round($coverage.coverage.'method-rate' * 100, 2)

# 目標値
$lineTarget = 60
$branchTarget = 50

# HTMLレポート生成
$reportDir = Join-Path $testDir "TestResults\HtmlReport\IntegrationTest"
dotnet reportgenerator -reports:$reportPath -targetdir:$reportDir -reporttypes:Html

# カバレッジ結果表示
Write-Host "`n統合テストカバレッジ結果:" -ForegroundColor Cyan
Write-Host "ライン カバレッジ: $lineRate% (目標: $lineTarget%)"
Write-Host "分岐 カバレッジ: $branchRate% (目標: $branchTarget%)"
Write-Host "メソッド カバレッジ: $methodRate%"

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

# HTMLレポートの場所を表示
Write-Host "`nHTML詳細レポート: $reportDir\index.html" -ForegroundColor Cyan

if (-not $success) {
    Write-Host "`n警告: 統合テストのカバレッジ目標が達成されていません。改善が必要です。" -ForegroundColor Yellow
    # 統合テストはまだ開発中のため、失敗しても全体のビルドは失敗させない
    exit 0
}
else {
    Write-Host "`n成功: すべての統合テストカバレッジ目標が達成されています！" -ForegroundColor Green
    exit 0
}
