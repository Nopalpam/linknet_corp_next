# RBAC System Installation Script
# Run this script to set up the RBAC system

Write-Host "================================" -ForegroundColor Cyan
Write-Host "RBAC System Installation" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "backend/package.json")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install ioredis @types/ioredis
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Checking Redis connection..." -ForegroundColor Yellow
$redisHost = $env:REDIS_HOST
if (-not $redisHost) { $redisHost = "localhost" }
$redisPort = $env:REDIS_PORT
if (-not $redisPort) { $redisPort = "6379" }

Write-Host "Attempting to connect to Redis at ${redisHost}:${redisPort}..." -ForegroundColor Gray
try {
    $tcpConnection = New-Object System.Net.Sockets.TcpClient
    $tcpConnection.Connect($redisHost, $redisPort)
    $tcpConnection.Close()
    Write-Host "✓ Redis is running and accessible" -ForegroundColor Green
} catch {
    Write-Host "⚠ Redis is not accessible. The system will work without caching." -ForegroundColor Yellow
    Write-Host "  To install Redis:" -ForegroundColor Gray
    Write-Host "  - Using Docker: docker run -d --name redis -p 6379:6379 redis:alpine" -ForegroundColor Gray
    Write-Host "  - Or download from: https://github.com/microsoftarchive/redis/releases" -ForegroundColor Gray
}
Write-Host ""

Write-Host "Step 3: Generating Prisma client..." -ForegroundColor Yellow
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error generating Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Prisma client generated" -ForegroundColor Green
Write-Host ""

Write-Host "Step 4: Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name add_rbac_system
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error running migrations" -ForegroundColor Red
    Write-Host "If migration already exists, you can skip this step." -ForegroundColor Yellow
}
Write-Host "✓ Migrations completed" -ForegroundColor Green
Write-Host ""

Write-Host "Step 5: Seeding database with RBAC data..." -ForegroundColor Yellow
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error seeding database" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Database seeded successfully" -ForegroundColor Green
Write-Host ""

Write-Host "Step 6: Verifying installation..." -ForegroundColor Yellow
$envFile = ".env"
if (Test-Path $envFile) {
    $hasRedisConfig = Select-String -Path $envFile -Pattern "REDIS_HOST" -Quiet
    if (-not $hasRedisConfig) {
        Write-Host "⚠ Redis configuration not found in .env file" -ForegroundColor Yellow
        Write-Host "  Add these lines to your .env file:" -ForegroundColor Gray
        Write-Host "  REDIS_HOST=localhost" -ForegroundColor Gray
        Write-Host "  REDIS_PORT=6379" -ForegroundColor Gray
        Write-Host "  REDIS_PASSWORD=" -ForegroundColor Gray
        Write-Host "  REDIS_DB=0" -ForegroundColor Gray
    } else {
        Write-Host "✓ Redis configuration found in .env" -ForegroundColor Green
    }
} else {
    Write-Host "⚠ .env file not found. Please create one based on .env.example" -ForegroundColor Yellow
}
Write-Host ""

Set-Location ..

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Default Users Created:" -ForegroundColor Cyan
Write-Host "  Super Admin:" -ForegroundColor White
Write-Host "    Email: admin@example.com" -ForegroundColor Gray
Write-Host "    Password: Admin123!" -ForegroundColor Gray
Write-Host "  Editor:" -ForegroundColor White
Write-Host "    Email: editor@example.com" -ForegroundColor Gray
Write-Host "    Password: Admin123!" -ForegroundColor Gray
Write-Host ""
Write-Host "RBAC Statistics:" -ForegroundColor Cyan
Write-Host "  • ~100 granular permissions" -ForegroundColor Gray
Write-Host "  • 15 permission modules" -ForegroundColor Gray
Write-Host "  • 4 default roles (Super Admin, Admin, Editor, User)" -ForegroundColor Gray
Write-Host "  • Redis caching support" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Start the backend server: cd backend && npm run dev" -ForegroundColor White
Write-Host "  2. Test login with default users" -ForegroundColor White
Write-Host "  3. Check documentation:" -ForegroundColor White
Write-Host "     - RBAC_GUIDE.md (Complete guide)" -ForegroundColor Gray
Write-Host "     - RBAC_QUICK_START.md (Quick reference)" -ForegroundColor Gray
Write-Host "     - RBAC_INTEGRATION_EXAMPLES.md (Code examples)" -ForegroundColor Gray
Write-Host ""
Write-Host "API Endpoints:" -ForegroundColor Cyan
Write-Host "  GET    /api/roles               - List all roles" -ForegroundColor Gray
Write-Host "  POST   /api/roles               - Create role" -ForegroundColor Gray
Write-Host "  PUT    /api/roles/:id           - Update role" -ForegroundColor Gray
Write-Host "  DELETE /api/roles/:id           - Delete role" -ForegroundColor Gray
Write-Host "  GET    /api/permissions/list    - Get all permissions" -ForegroundColor Gray
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
