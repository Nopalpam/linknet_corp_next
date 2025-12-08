# Test Error Handling & Logging System

# Test endpoints untuk verify bahwa error handling bekerja dengan benar

$baseUrl = "http://localhost:5000"
$apiUrl = "$baseUrl/api/v1"

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  ERROR HANDLING & LOGGING TEST" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Test 1: Success Response
Write-Host "`n[TEST 1] Success Response" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/examples/success" -Method Get
    Write-Host "✓ Status: Success" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Validation Error
Write-Host "`n[TEST 2] Validation Error (400)" -ForegroundColor Yellow
try {
    $body = @{
        email = "invalid-email"
        name = ""
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiUrl/examples/validate" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    Write-Host "✗ Should have failed validation" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Status: Error caught" -ForegroundColor Green
    Write-Host "Response: $($errorResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
}

# Test 3: Validation Success
Write-Host "`n[TEST 3] Validation Success" -ForegroundColor Yellow
try {
    $body = @{
        email = "test@example.com"
        name = "John Doe"
        age = 25
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$apiUrl/examples/validate" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    Write-Host "✓ Status: Validation passed" -ForegroundColor Green
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Custom Validation Error
Write-Host "`n[TEST 4] Custom Validation Error" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/examples/custom-validation" -Method Get
    Write-Host "✗ Should have thrown validation error" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Status: Error caught" -ForegroundColor Green
    Write-Host "Response: $($errorResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
}

# Test 5: Not Found Error
Write-Host "`n[TEST 5] Not Found Error (404)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/examples/not-found/123" -Method Get
    Write-Host "✗ Should have thrown not found error" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Status: Error caught" -ForegroundColor Green
    Write-Host "Response: $($errorResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
}

# Test 6: Unauthorized Error
Write-Host "`n[TEST 6] Unauthorized Error (401)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/examples/unauthorized" -Method Get
    Write-Host "✗ Should have thrown unauthorized error" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Status: Error caught" -ForegroundColor Green
    Write-Host "Response: $($errorResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
}

# Test 7: Database Error
Write-Host "`n[TEST 7] Database Error (500)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/examples/database-error" -Method Get
    Write-Host "✗ Should have thrown database error" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Status: Error caught" -ForegroundColor Green
    Write-Host "Response: $($errorResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
}

# Test 8: Unexpected Error
Write-Host "`n[TEST 8] Unexpected Error (500)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/examples/unexpected-error" -Method Get
    Write-Host "✗ Should have thrown unexpected error" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Status: Error caught" -ForegroundColor Green
    Write-Host "Response: $($errorResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
}

# Test 9: Async Error
Write-Host "`n[TEST 9] Async Error (500)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/examples/async-error" -Method Get
    Write-Host "✗ Should have thrown async error" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Status: Error caught" -ForegroundColor Green
    Write-Host "Response: $($errorResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
}

# Test 10: Route Not Found (404)
Write-Host "`n[TEST 10] Route Not Found (404)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/nonexistent-route" -Method Get
    Write-Host "✗ Should have returned 404" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✓ Status: Error caught" -ForegroundColor Green
    Write-Host "Response: $($errorResponse | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
}

# Test 11: Request ID Header
Write-Host "`n[TEST 11] Request ID Tracking" -ForegroundColor Yellow
try {
    $headers = @{
        "X-Request-ID" = "custom-request-id-12345"
    }
    $response = Invoke-WebRequest -Uri "$apiUrl/examples/success" -Method Get -Headers $headers
    $requestId = $response.Headers["X-Request-ID"]
    Write-Host "✓ Status: Success" -ForegroundColor Green
    Write-Host "Request ID: $requestId" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 12: Rate Limiting (test with multiple requests)
Write-Host "`n[TEST 12] Rate Limiting Test" -ForegroundColor Yellow
Write-Host "Making 5 rapid requests to test rate limiting..." -ForegroundColor Gray
for ($i = 1; $i -le 5; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$apiUrl/examples/success" -Method Get
        $remaining = $response.Headers["RateLimit-Remaining"]
        Write-Host "  Request $i - Success (Remaining: $remaining)" -ForegroundColor Gray
    } catch {
        Write-Host "  Request $i - Failed: Rate limit exceeded" -ForegroundColor Yellow
    }
    Start-Sleep -Milliseconds 100
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "  ALL TESTS COMPLETED" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`nCheck the logs in backend/logs/ for detailed logging output" -ForegroundColor Cyan
