# Script untuk menjalankan backend development server
Write-Host "=== Starting LinkNet Corp Backend ===" -ForegroundColor Cyan
Write-Host ""

# Masuk ke direktori backend
Set-Location $PSScriptRoot

# Jalankan npm run dev
npm run dev
