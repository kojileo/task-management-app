#!/usr/bin/env pwsh

$ErrorActionPreference = "Stop"
Write-Host "Running Backend Static Analysis" -ForegroundColor Cyan

# Move to project directory
$backendDir = Join-Path $PSScriptRoot "..\..\backend"
Set-Location $backendDir

# Check solution existence
if (-not (Test-Path "TaskManagement.sln")) {
    Write-Host "Error: TaskManagement.sln not found" -ForegroundColor Red
    exit 1
}

# Check required NuGet packages
Write-Host "Checking StyleCop.Analyzers configuration..." -ForegroundColor Yellow
$apiProjFile = Join-Path $backendDir "TaskManagement.API\TaskManagement.API.csproj"
$testsProjFile = Join-Path $backendDir "TaskManagement.Tests\TaskManagement.Tests.csproj"

$apiProjContent = Get-Content $apiProjFile -Raw
if (-not ($apiProjContent -match "StyleCop.Analyzers")) {
    Write-Host "Warning: StyleCop.Analyzers not added to API project" -ForegroundColor Yellow
}

# Build check (code style violations are displayed during build)
Write-Host "Building solution to run static analysis..." -ForegroundColor Yellow
dotnet build TaskManagement.sln /p:TreatWarningsAsErrors=true

$buildResult = $LASTEXITCODE
if ($buildResult -eq 0) {
    Write-Host "Build successful (no static analysis errors)" -ForegroundColor Green
} 
else {
    Write-Host "Build failed (errors or warnings present)" -ForegroundColor Red
    Write-Host "Check detailed error/warning messages above" -ForegroundColor Yellow
}

# Optional code metrics section
$metricsResult = 0
$apiDir = Join-Path $backendDir "TaskManagement.API"
Set-Location $apiDir

# Check if code metrics tool is available
$codeMetricsAvailable = $false
try {
    $toolInfo = dotnet tool list -g | Select-String "dotnet-code-metrics"
    if ($toolInfo) {
        $codeMetricsAvailable = $true
    }
} catch {
    # Tool check failed, assume not available
}

if ($codeMetricsAvailable) {
    # Run code metrics if available
    Write-Host "Calculating code metrics..." -ForegroundColor Yellow
    dotnet-code-metrics --include-project-references --report-format Markdown > "code-metrics.md"
    $metricsResult = $LASTEXITCODE

    if ($metricsResult -eq 0 -and (Test-Path "code-metrics.md")) {
        Write-Host "Code metrics report generated: $apiDir\code-metrics.md" -ForegroundColor Green
    } 
    else {
        Write-Host "Problem generating code metrics report" -ForegroundColor Yellow
    }
}
else {
    Write-Host "Code metrics tool not installed. To install: dotnet tool install -g dotnet-code-metrics" -ForegroundColor Yellow
    Write-Host "Skipping code metrics analysis" -ForegroundColor Yellow
}

# Display StyleCop analysis results summary
Write-Host "`nStatic Analysis Results:" -ForegroundColor Cyan
$buildStatusText = if ($buildResult -eq 0) { "Success" } else { "Failed" }
$metricsStatusText = if ($codeMetricsAvailable) {
    if ($metricsResult -eq 0 -and (Test-Path "$apiDir\code-metrics.md")) { "Success" } else { "Warning" }
} else {
    "Skipped (tool not installed)"
}

Write-Host "Build Check: $buildStatusText"
Write-Host "Code Metrics: $metricsStatusText"

# Set return value
if ($buildResult -eq 0) {
    Write-Host "`nStatic analysis check succeeded" -ForegroundColor Green
    exit 0
} 
else {
    Write-Host "`nStatic analysis check failed" -ForegroundColor Red
    exit 1
} 