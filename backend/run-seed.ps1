# PowerShell script to run database seeding
# This will seed the database with default users, roles, and permissions

Write-Host "🌱 Starting database seeding..." -ForegroundColor Cyan
Write-Host ""

# Change to backend directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Run Prisma seed
Write-Host "🌱 Running Prisma seed..." -ForegroundColor Cyan
npx prisma db seed

Write-Host ""
Write-Host "✅ Database seeding complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Default User Accounts:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "🔐 Super Admin" -ForegroundColor Cyan
Write-Host "   Email    : admin@linknet.co.id" -ForegroundColor White
Write-Host "   Password : Admin123!" -ForegroundColor White
Write-Host "   Role     : Super Admin (Full Access)" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Admin" -ForegroundColor Cyan
Write-Host "   Email    : admin@example.com" -ForegroundColor White
Write-Host "   Password : Admin123!" -ForegroundColor White
Write-Host "   Role     : Admin (Content Management)" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Editor" -ForegroundColor Cyan
Write-Host "   Email    : editor@example.com" -ForegroundColor White
Write-Host "   Password : Admin123!" -ForegroundColor White
Write-Host "   Role     : Editor (Limited Access)" -ForegroundColor White
Write-Host ""
Write-Host "🔐 User" -ForegroundColor Cyan
Write-Host "   Email    : user@example.com" -ForegroundColor White
Write-Host "   Password : Admin123!" -ForegroundColor White
Write-Host "   Role     : User (Basic Access)" -ForegroundColor White
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tip: Login dengan akun Super Admin untuk akses penuh ke Roles & Permissions" -ForegroundColor Yellow
Write-Host ""
