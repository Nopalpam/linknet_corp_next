# Awards Management Setup Script
# This script sets up the awards management system

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Awards Management Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "backend/prisma/schema.prisma")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Step 1: Running database migration..." -ForegroundColor Yellow
Set-Location backend

try {
    npx prisma migrate dev --name add_awards_table
    Write-Host "✅ Database migration completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Migration failed: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "📋 Step 2: Generating Prisma Client..." -ForegroundColor Yellow

try {
    npx prisma generate
    Write-Host "✅ Prisma Client generated successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Prisma generate failed: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host ""
Write-Host "📋 Step 3: Seeding award permissions..." -ForegroundColor Yellow

try {
    npx ts-node prisma/seeds/award-permissions.seed.ts
    Write-Host "✅ Permissions seeded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Seeding failed: $_" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Next Steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the backend server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the frontend server (in new terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Access the applications:" -ForegroundColor White
Write-Host "   CMS:    http://localhost:3000/cms/awards" -ForegroundColor Gray
Write-Host "   Public: http://localhost:3000/about/awards" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Documentation:" -ForegroundColor Cyan
Write-Host "   - AWARDS_QUICK_START.md" -ForegroundColor Gray
Write-Host "   - AWARDS_MANAGEMENT_README.md" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
