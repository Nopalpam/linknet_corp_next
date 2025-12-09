# JWT Authentication System Setup Script
# Run this script to set up the robust JWT authentication system

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "JWT Authentication System Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the project root
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Backend Setup
Write-Host "Step 1: Setting up Backend..." -ForegroundColor Yellow
Write-Host ""

Set-Location backend

# Install dependencies
Write-Host "Installing node-cron..." -ForegroundColor Green
npm install node-cron @types/node-cron

# Generate Prisma client
Write-Host "Generating Prisma client..." -ForegroundColor Green
npm run db:generate

# Ask user if they want to run migration
Write-Host ""
Write-Host "Do you want to run database migration now? (Y/N)" -ForegroundColor Yellow
$runMigration = Read-Host

if ($runMigration -eq "Y" -or $runMigration -eq "y") {
    Write-Host "Running database migration..." -ForegroundColor Green
    npm run db:migrate
} else {
    Write-Host "Skipping migration. Remember to run 'npm run db:migrate' later!" -ForegroundColor Yellow
}

# Generate JWT secrets
Write-Host ""
Write-Host "Step 2: Generating JWT Secrets..." -ForegroundColor Yellow
Write-Host ""

$accessSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
$refreshSecret = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

Write-Host "Generated secrets (add these to your .env file):" -ForegroundColor Green
Write-Host "JWT_ACCESS_SECRET=$accessSecret" -ForegroundColor Cyan
Write-Host "JWT_REFRESH_SECRET=$refreshSecret" -ForegroundColor Cyan
Write-Host ""

# Ask if user wants to update .env
Write-Host "Do you want to update .env file automatically? (Y/N)" -ForegroundColor Yellow
$updateEnv = Read-Host

if ($updateEnv -eq "Y" -or $updateEnv -eq "y") {
    # Backup existing .env
    if (Test-Path ".env") {
        Copy-Item ".env" ".env.backup"
        Write-Host "Backed up existing .env to .env.backup" -ForegroundColor Green
    }
    
    # Update .env file
    $envContent = Get-Content ".env" -Raw
    $envContent = $envContent -replace 'JWT_ACCESS_SECRET=.*', "JWT_ACCESS_SECRET=$accessSecret"
    $envContent = $envContent -replace 'JWT_REFRESH_SECRET=.*', "JWT_REFRESH_SECRET=$refreshSecret"
    Set-Content ".env" $envContent
    
    Write-Host ".env file updated successfully!" -ForegroundColor Green
} else {
    Write-Host "Please update your .env file manually with the secrets above." -ForegroundColor Yellow
}

Set-Location ..

# Frontend Setup
Write-Host ""
Write-Host "Step 3: Frontend setup complete!" -ForegroundColor Yellow
Write-Host "New files created:" -ForegroundColor Green
Write-Host "  - frontend/lib/api-client-enhanced.ts" -ForegroundColor Cyan
Write-Host "  - frontend/lib/auth-context-enhanced.tsx" -ForegroundColor Cyan
Write-Host ""

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend changes:" -ForegroundColor Yellow
Write-Host "  ✓ Updated Prisma schema with token rotation support" -ForegroundColor Green
Write-Host "  ✓ Enhanced JWT utilities with roles & permissions" -ForegroundColor Green
Write-Host "  ✓ Updated auth middleware with better error handling" -ForegroundColor Green
Write-Host "  ✓ Implemented token refresh with rotation" -ForegroundColor Green
Write-Host "  ✓ Added logout & logout-all endpoints" -ForegroundColor Green
Write-Host "  ✓ Created token cleanup cron job" -ForegroundColor Green
Write-Host "  ✓ Updated environment variables" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend changes:" -ForegroundColor Yellow
Write-Host "  ✓ Created enhanced API client with auto-refresh" -ForegroundColor Green
Write-Host "  ✓ Created enhanced auth context with roles/permissions" -ForegroundColor Green
Write-Host "  ✓ Token storage in sessionStorage + localStorage" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review JWT_AUTHENTICATION_GUIDE.md for detailed documentation" -ForegroundColor Cyan
Write-Host "  2. Update frontend to use AuthProviderEnhanced" -ForegroundColor Cyan
Write-Host "  3. Test login/logout flow" -ForegroundColor Cyan
Write-Host "  4. Test token refresh mechanism" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the backend:" -ForegroundColor Yellow
Write-Host "  cd backend && npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start the frontend:" -ForegroundColor Yellow
Write-Host "  cd frontend && npm run dev" -ForegroundColor Cyan
Write-Host ""
