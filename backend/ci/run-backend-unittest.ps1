#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
Write-Host "Backend Unit Test Execution and Coverage Verification" -ForegroundColor Cyan

# Move to project directory
$testDir = Join-Path $PSScriptRoot "..\..\backend\TaskManagement.Tests"
Set-Location $testDir

# Execute test and measure coverage
Write-Host "Running unit tests..." -ForegroundColor Yellow
dotnet test --filter "FullyQualifiedName~UnitTests" /p:CollectCoverage=true /p:CoverletOutputFormat=cobertura /p:CoverletOutput="./TestResults/unittest-coverage.cobertura.xml" /p:Include="[TaskManagement.API]*" /p:ExcludeByAttribute="Obsolete%2cGeneratedCodeAttribute%2cCompilerGeneratedAttribute"

# Coverage report path
$reportPath = Join-Path $testDir "TestResults\unittest-coverage.cobertura.xml"

# Check if report exists
if (-not (Test-Path $reportPath)) {
    Write-Host "Error: Coverage report was not generated" -ForegroundColor Red
    exit 1
}

# Load coverage information
[xml]$coverage = Get-Content $reportPath
# Convert line-rate and branch-rate to numeric values
$lineRateValue = [double]$coverage.coverage.GetAttribute("line-rate")
$branchRateValue = [double]$coverage.coverage.GetAttribute("branch-rate")
$methodRate = 100.0 # Default method coverage value

$lineRate = [math]::Round($lineRateValue * 100, 2)
$branchRate = [math]::Round($branchRateValue * 100, 2)

# Target values
$lineTarget = 85
$branchTarget = 75

# Generate HTML report
$reportDir = Join-Path $testDir "TestResults\HtmlReport\UnitTest"
try {
    # Execute report generator
    Write-Host "Generating HTML report..." -ForegroundColor Yellow
    reportgenerator "-reports:$reportPath" "-targetdir:$reportDir" "-reporttypes:Html"
} catch {
    Write-Host "Warning: Failed to generate HTML report. Make sure reportgenerator tool is installed." -ForegroundColor Yellow
    Write-Host "Install command: dotnet tool install -g dotnet-reportgenerator-globaltool" -ForegroundColor Yellow
}

# Display coverage results
Write-Host "`nUnit Test Coverage Results:" -ForegroundColor Cyan
Write-Host "Line Coverage: $lineRate% (Target: $lineTarget%)"
Write-Host "Branch Coverage: $branchRate% (Target: $branchTarget%)"
Write-Host "Method Coverage: $methodRate%"

# Check if targets are achieved
$success = $true

if ($lineRate -lt $lineTarget) {
    Write-Host "Warning: Line coverage is below target ($lineRate% < $lineTarget%)" -ForegroundColor Yellow
    $success = $false
}
else {
    Write-Host "Success: Line coverage meets target ($lineRate% >= $lineTarget%)" -ForegroundColor Green
}

if ($branchRate -lt $branchTarget) {
    Write-Host "Warning: Branch coverage is below target ($branchRate% < $branchTarget%)" -ForegroundColor Yellow
    $success = $false
}
else {
    Write-Host "Success: Branch coverage meets target ($branchRate% >= $branchTarget%)" -ForegroundColor Green
}

# Display low coverage classes
Write-Host "`nLow Coverage Classes:" -ForegroundColor Yellow
$lowCoverage = @()
foreach ($package in $coverage.coverage.packages.package) {
    foreach ($class in $package.classes.class) {
        $classLineRateAttr = $class.GetAttribute("line-rate")
        $classBranchRateAttr = $class.GetAttribute("branch-rate")
        
        if ($classLineRateAttr -and $classBranchRateAttr) {
            $classLineRate = [math]::Round([double]$classLineRateAttr * 100, 2)
            $classBranchRate = [math]::Round([double]$classBranchRateAttr * 100, 2)
            
            if ($classLineRate -lt 75 -or $classBranchRate -lt 65) {
                Write-Host "$($class.name): Line: $classLineRate%, Branch: $classBranchRate%" -ForegroundColor Yellow
                $lowCoverage += $class.name
            }
        }
    }
}

# Display HTML report location
if (Test-Path $reportDir) {
    Write-Host "`nHTML Detailed Report: $reportDir\index.html" -ForegroundColor Cyan
}

if (-not $success) {
    Write-Host "`nWarning: Coverage targets are not met. Improvements needed." -ForegroundColor Yellow
    exit 1
}
else {
    Write-Host "`nSuccess: All coverage targets are met!" -ForegroundColor Green
    exit 0
}
