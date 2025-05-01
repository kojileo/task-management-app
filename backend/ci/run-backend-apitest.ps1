#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
Write-Host "バックエンドAPIテスト実行とカバレッジ検証" -ForegroundColor Cyan

# プロジェクトディレクトリに移動
$testDir = Join-Path $PSScriptRoot "..\..\backend\TaskManagement.Tests"
Set-Location $testDir

# APIテスト実行とカバレッジ測定
# 現在のプロジェクト構造ではAPIテスト用のフォルダが明示されていないため、コントローラーテストをAPIテストとして扱う
Write-Host "APIテスト実行中..." -ForegroundColor Yellow
dotnet test --filter "FullyQualifiedName~UnitTests.Controllers" /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura /p:CoverletOutput="./TestResults/apitest-coverage.cobertura.xml" /p:Include="[TaskManagement.API]*" /p:ExcludeByAttribute="Obsolete%2cGeneratedCodeAttribute%2cCompilerGeneratedAttribute"

# カバレッジレポートのパス
$reportPath = Join-Path $testDir "TestResults\apitest-coverage.cobertura.xml"

# レポートが存在するか確認
if (-not (Test-Path $reportPath)) {
    Write-Host "エラー: カバレッジレポートが生成されませんでした" -ForegroundColor Red
    exit 1
}

# カバレッジ情報を読み込む
[xml]$coverage = Get-Content $reportPath
$lineRate = [math]::Round($coverage.coverage.'line-rate' * 100, 2)
$branchRate = [math]::Round($coverage.coverage.'branch-rate' * 100, 2)
$methodRate = [math]::Round($coverage.coverage.'method-rate' * 100, 2)

# 目標値
$lineTarget = 40
$branchTarget = 30

# HTMLレポート生成
$reportDir = Join-Path $testDir "TestResults\HtmlReport\ApiTest"
dotnet reportgenerator -reports:$reportPath -targetdir:$reportDir -reporttypes:Html

# カバレッジ結果表示
Write-Host "`nAPIテストカバレッジ結果:" -ForegroundColor Cyan
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

# APIクラス（コントローラー）のカバレッジ詳細を表示
Write-Host "`nAPIコントローラーのカバレッジ詳細:" -ForegroundColor Cyan
foreach ($package in $coverage.coverage.packages.package) {
    foreach ($class in $package.classes.class) {
        if ($class.name -like "*Controller*") {
            $classLineRate = [math]::Round($class.'line-rate' * 100, 2)
            $classBranchRate = [math]::Round($class.'branch-rate' * 100, 2)
            Write-Host "$($class.name): Line: $classLineRate%, Branch: $classBranchRate%" -ForegroundColor $(if ($classLineRate -lt $lineTarget -or $classBranchRate -lt $branchTarget) { "Yellow" } else { "Green" })
        }
    }
}

# HTMLレポートの場所を表示
Write-Host "`nHTML詳細レポート: $reportDir\index.html" -ForegroundColor Cyan

if (-not $success) {
    Write-Host "`n警告: APIテストのカバレッジ目標が達成されていません。改善が必要です。" -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "`n成功: すべてのAPIテストカバレッジ目標が達成されています！" -ForegroundColor Green
    exit 0
}
