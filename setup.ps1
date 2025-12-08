# LinkNet Corp - Installation & Setup Script
# This script automates the installation of both backend and frontend dependencies

Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  LinkNet Corp - Full Stack Setup" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js is not installed!" -ForegroundColor Red
    Write-Host "  Please install Node.js from https://nodejs.org" -ForegroundColor Red
    exit 1
}

try {
    $npmVersion = npm --version
    Write-Host "✓ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Installing Backend Dependencies" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-Location backend

if (Test-Path "node_modules") {
    Write-Host "Removing existing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules
}

Write-Host "Running npm install..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Backend dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Backend installation failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Create .env if it doesn't exist
if (-Not (Test-Path ".env")) {
    Write-Host "Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✓ .env file created. Please update it with your configuration." -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Installing Frontend Dependencies" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Set-Location frontend

if (Test-Path "node_modules") {
    Write-Host "Removing existing node_modules..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force node_modules
}

Write-Host "Running npm install..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Frontend dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Frontend installation failed!" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Create .env.local if it doesn't exist
if (-Not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local file from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✓ .env.local file created. Please update it with your configuration." -ForegroundColor Green
}

Set-Location ..

Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Configure environment variables:" -ForegroundColor White
Write-Host "   - Edit backend/.env" -ForegroundColor Gray
Write-Host "   - Edit frontend/.env.local" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Start the backend server:" -ForegroundColor White
Write-Host "   cd backend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Start the frontend server (in new terminal):" -ForegroundColor White
Write-Host "   cd frontend" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Open your browser:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Backend:  http://localhost:5000" -ForegroundColor Gray
Write-Host ""
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Happy Coding! 🚀" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════" -ForegroundColor Cyan
