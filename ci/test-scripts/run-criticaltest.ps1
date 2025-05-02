#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
Write-Host "重要機能（API通信処理）のテストカバレッジ検証" -ForegroundColor Cyan

# プロジェクトディレクトリに移動
$backendTestDir = Join-Path $PSScriptRoot "..\..\backend\TaskManagement.Tests"
Set-Location $backendTestDir

# テスト実行とカバレッジ測定
Write-Host "重要機能テスト実行中..." -ForegroundColor Yellow

# APIコミュニケーション処理が含まれるフィルタを使用（Controller, API Gateway, HTTP Clientなど）
# これはプロジェクト構造によって調整が必要です
dotnet test --filter "FullyQualifiedName~UnitTests.Controllers" /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura /p:CoverletOutput="./TestResults/criticaltest-coverage.cobertura.xml" /p:Include="[TaskManagement.API]*.Controllers*" /p:ExcludeByAttribute="Obsolete%2cGeneratedCodeAttribute%2cCompilerGeneratedAttribute"

# カバレッジレポートのパス
$reportPath = Join-Path $backendTestDir "TestResults\criticaltest-coverage.cobertura.xml"

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

# 目標値（重要機能は100%必須）
$lineTarget = 100
$branchTarget = 100

# HTMLレポート生成
$reportDir = Join-Path $backendTestDir "TestResults\HtmlReport\CriticalTest"
dotnet reportgenerator -reports:$reportPath -targetdir:$reportDir -reporttypes:Html

# カバレッジ結果表示
Write-Host "`n重要機能テストカバレッジ結果:" -ForegroundColor Cyan
Write-Host "ライン カバレッジ: $lineRate% (目標: $lineTarget%)"
Write-Host "分岐 カバレッジ: $branchRate% (目標: $branchTarget%)"
Write-Host "メソッド カバレッジ: $methodRate%"

# 結果が目標を達成しているか確認
$success = $true

if ($lineRate -lt $lineTarget) {
    Write-Host "警告: 重要機能のラインカバレッジが100%に達していません（$lineRate%）" -ForegroundColor Red
    $success = $false
}
else {
    Write-Host "成功: 重要機能のラインカバレッジが100%達成されています" -ForegroundColor Green
}

if ($branchRate -lt $branchTarget) {
    Write-Host "警告: 重要機能の分岐カバレッジが100%に達していません（$branchRate%）" -ForegroundColor Red
    $success = $false
}
else {
    Write-Host "成功: 重要機能の分岐カバレッジが100%達成されています" -ForegroundColor Green
}

# APIコントローラーごとのカバレッジ詳細を表示
Write-Host "`n重要機能（APIコントローラー）のカバレッジ詳細:" -ForegroundColor Cyan
$hasLowCoverage = $false
foreach ($package in $coverage.coverage.packages.package) {
    foreach ($class in $package.classes.class) {
        if ($class.name -like "*Controller*") {
            $classLineRate = [math]::Round($class.'line-rate' * 100, 2)
            $classBranchRate = [math]::Round($class.'branch-rate' * 100, 2)
            
            if ($classLineRate -lt 100 -or $classBranchRate -lt 100) {
                Write-Host "$($class.name): Line: $classLineRate%, Branch: $classBranchRate%" -ForegroundColor Red
                $hasLowCoverage = $true
                
                # メソッドレベルでカバレッジが100%未満のものを特定
                foreach ($method in $class.methods.method) {
                    $methodLineRate = [math]::Round($method.'line-rate' * 100, 2)
                    $methodBranchRate = [math]::Round($method.'branch-rate' * 100, 2)
                    
                    if ($methodLineRate -lt 100 -or $methodBranchRate -lt 100) {
                        Write-Host "  - メソッド: $($method.name): Line: $methodLineRate%, Branch: $methodBranchRate%" -ForegroundColor Red
                    }
                }
            }
            else {
                Write-Host "$($class.name): Line: $classLineRate%, Branch: $classBranchRate%" -ForegroundColor Green
            }
        }
    }
}

# HTMLレポートの場所を表示
Write-Host "`nHTML詳細レポート: $reportDir\index.html" -ForegroundColor Cyan

if (-not $success) {
    Write-Host "`n警告: 重要機能のカバレッジが100%に達していません。これは緊急の改善が必要です！" -ForegroundColor Red
    Write-Host "テスト追加が必要なクラスとメソッドは上記の詳細を参照してください。" -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "`n成功: すべての重要機能が100%カバレッジを達成しています！" -ForegroundColor Green
    exit 0
}
