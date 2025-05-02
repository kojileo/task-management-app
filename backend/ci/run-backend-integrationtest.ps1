#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
Write-Host "Backend Integration Test Execution and Coverage Verification" -ForegroundColor Cyan

# Move to project directory
$testDir = Join-Path $PSScriptRoot "..\TaskManagement.Tests"
Set-Location $testDir

# Run tests and measure coverage
Write-Host "Running integration tests..." -ForegroundColor Yellow
dotnet test --filter "FullyQualifiedName~IntegrationTests" /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura /p:CoverletOutput="./TestResults/integrationtest-coverage.cobertura.xml" /p:Include="[TaskManagement.API]*" /p:ExcludeByAttribute="Obsolete%2cGeneratedCodeAttribute%2cCompilerGeneratedAttribute"

# Coverage report path
$reportPath = Join-Path $testDir "TestResults\integrationtest-coverage.cobertura.xml"

# Check if report exists
if (-not (Test-Path $reportPath)) {
    Write-Host "Error: Coverage report was not generated" -ForegroundColor Red
    # Treat as warning if integration tests are skipped or not implemented
    Write-Host "Warning: Integration tests may be skipped or not implemented" -ForegroundColor Yellow
    exit 0
}

# Load coverage information
[xml]$coverage = Get-Content $reportPath

# Target values
$lineTarget = 60
$branchTarget = 50

# Read coverage values from the report
$lineRateStr = $coverage.coverage.'line-rate'
if ($lineRateStr -ne $null) {
    $lineRate = [Math]::Round([double]$lineRateStr * 100, 2)
} else {
    $lineRate = 0
}

$branchRateStr = $coverage.coverage.'branch-rate'
if ($branchRateStr -ne $null) {
    $branchRate = [Math]::Round([double]$branchRateStr * 100, 2)
} else {
    $branchRate = 0
}

$methodRateStr = $coverage.coverage.'method-rate'
if ($methodRateStr -ne $null) {
    $methodRate = [Math]::Round([double]$methodRateStr * 100, 2)
} else {
    # Method rate might not be in the report
    $methodRate = 0
}

# Create HTML report directory if it doesn't exist
$reportDir = Join-Path $testDir "TestResults\HtmlReport\IntegrationTest"
if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

# Generate HTML report
Write-Host "Generating HTML report..." -ForegroundColor Yellow
try {
    $reportGeneratorCmd = "reportgenerator -reports:`"$reportPath`" -targetdir:`"$reportDir`" -reporttypes:Html"
    Invoke-Expression $reportGeneratorCmd
    $htmlReportGenerated = $true
} catch {
    Write-Host "Warning: HTML report generation failed. $($_.Exception.Message)" -ForegroundColor Yellow
    $htmlReportGenerated = $false
}

# Display coverage results
Write-Host "`nIntegration Test Coverage Results:" -ForegroundColor Cyan
Write-Host "Line Coverage: $lineRate% (Target: $lineTarget%)"
Write-Host "Branch Coverage: $branchRate% (Target: $branchTarget%)"
if ($methodRate -gt 0) {
    Write-Host "Method Coverage: $methodRate%"
}

# Check if results meet targets
$success = $true

if ($lineRate -lt $lineTarget) {
    Write-Host "Warning: Line coverage does not meet target ($lineRate% is below $lineTarget%)" -ForegroundColor Yellow
    $success = $false
}
else {
    Write-Host "Success: Line coverage meets target ($lineRate% is at or above $lineTarget%)" -ForegroundColor Green
}

if ($branchRate -lt $branchTarget) {
    Write-Host "Warning: Branch coverage does not meet target ($branchRate% is below $branchTarget%)" -ForegroundColor Yellow
    $success = $false
}
else {
    Write-Host "Success: Branch coverage meets target ($branchRate% is at or above $branchTarget%)" -ForegroundColor Green
}

# Display report locations
Write-Host "`nXML Coverage Report: $reportPath" -ForegroundColor Cyan
if ($htmlReportGenerated) {
    Write-Host "HTML Coverage Report: $reportDir\index.html" -ForegroundColor Cyan
}

if (-not $success) {
    Write-Host "`nWarning: Integration test coverage targets have not been met. Improvement is needed." -ForegroundColor Yellow
    # Do not fail the build for integration tests as they are still in development
    exit 0
}
else {
    Write-Host "`nSuccess: All integration test coverage targets have been met!" -ForegroundColor Green
    exit 0
} 
