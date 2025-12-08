# Simple Error Handling Test
Write-Host "Testing Error Handling System..." -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api/v1"

# Test 1: Success
Write-Host "`n[1] Testing Success Response..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/examples/success" -Method Get
    Write-Host "SUCCESS: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "FAILED" -ForegroundColor Red
}

# Test 2: Validation Error
Write-Host "`n[2] Testing Validation Error..." -ForegroundColor Yellow
try {
    $body = '{"email":"invalid","name":""}'
    Invoke-RestMethod -Uri "$baseUrl/examples/validate" -Method Post -ContentType "application/json" -Body $body
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "SUCCESS: Got error code: $($error.error.code)" -ForegroundColor Green
}

# Test 3: Not Found
Write-Host "`n[3] Testing Not Found Error..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/examples/not-found/123" -Method Get
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "SUCCESS: Got error code: $($error.error.code)" -ForegroundColor Green
}

# Test 4: Unauthorized
Write-Host "`n[4] Testing Unauthorized Error..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/examples/unauthorized" -Method Get
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "SUCCESS: Got error code: $($error.error.code)" -ForegroundColor Green
}

# Test 5: Database Error
Write-Host "`n[5] Testing Database Error..." -ForegroundColor Yellow
try {
    Invoke-RestMethod -Uri "$baseUrl/examples/database-error" -Method Get
} catch {
    $error = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "SUCCESS: Got error code: $($error.error.code)" -ForegroundColor Green
}

Write-Host "`nAll tests completed!" -ForegroundColor Cyan
