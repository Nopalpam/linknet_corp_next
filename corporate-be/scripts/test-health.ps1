# Test Health Check Endpoints
# Run this script to test all health endpoints

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Health Check Endpoint Testing" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://dev-be.lncorp.local"

# Function to test endpoint
function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "Testing: $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    Write-Host "Description: $Description" -ForegroundColor Gray
    Write-Host ""
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 10
        Write-Host "Status: SUCCESS" -ForegroundColor Green
        Write-Host "Response:" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5 | Write-Host
    }
    catch {
        Write-Host "Status: FAILED" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "------------------------------------------------" -ForegroundColor Gray
    Write-Host ""
}

# Test each endpoint
Test-Endpoint `
    -Name "Basic Health Check" `
    -Url "$baseUrl/health" `
    -Description "Liveness probe - checks if application is running"

Test-Endpoint `
    -Name "Readiness Check" `
    -Url "$baseUrl/ready" `
    -Description "Readiness probe - checks database and dependencies"

Test-Endpoint `
    -Name "Environment Check" `
    -Url "$baseUrl/env-check" `
    -Description "Validates Azure Key Vault connection and env vars"

Test-Endpoint `
    -Name "Detailed Health Check" `
    -Url "$baseUrl/health/detailed" `
    -Description "Comprehensive diagnostics including memory and system info"

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Testing Complete" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
