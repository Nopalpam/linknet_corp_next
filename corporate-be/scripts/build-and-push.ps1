# Build and Push Docker Image to Azure Container Registry
# Usage: .\build-and-push.ps1 -AcrName "linknetcorpacr" -ImageTag "v1.0.0"

param(
    [Parameter(Mandatory=$true)]
    [string]$AcrName,
    
    [Parameter(Mandatory=$false)]
    [string]$ImageTag = "latest",
    
    [Parameter(Mandatory=$false)]
    [string]$ImageName = "linknetcorp-backend"
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Docker Build & Push to ACR" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Configuration
$localImage = "${ImageName}:${ImageTag}"
$acrImage = "${AcrName}.azurecr.io/${ImageName}:${ImageTag}"
$acrImageLatest = "${AcrName}.azurecr.io/${ImageName}:latest"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  ACR Name: $AcrName" -ForegroundColor Gray
Write-Host "  Image Name: $ImageName" -ForegroundColor Gray
Write-Host "  Image Tag: $ImageTag" -ForegroundColor Gray
Write-Host "  Local Image: $localImage" -ForegroundColor Gray
Write-Host "  ACR Image: $acrImage" -ForegroundColor Gray
Write-Host ""

# Step 1: Check if Docker is running
Write-Host "[1/6] Checking Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "  ✓ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "  ✗ Docker is not running!" -ForegroundColor Red
    Write-Host "  Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Build Docker image
Write-Host "[2/6] Building Docker image..." -ForegroundColor Yellow
try {
    docker build -t $localImage .
    Write-Host "  ✓ Image built successfully: $localImage" -ForegroundColor Green
}
catch {
    Write-Host "  ✗ Failed to build image!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Tag for ACR
Write-Host "[3/6] Tagging image for ACR..." -ForegroundColor Yellow
try {
    docker tag $localImage $acrImage
    if ($ImageTag -ne "latest") {
        docker tag $localImage $acrImageLatest
        Write-Host "  ✓ Tagged: $acrImage" -ForegroundColor Green
        Write-Host "  ✓ Tagged: $acrImageLatest" -ForegroundColor Green
    }
    else {
        Write-Host "  ✓ Tagged: $acrImage" -ForegroundColor Green
    }
}
catch {
    Write-Host "  ✗ Failed to tag image!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Login to ACR
Write-Host "[4/6] Logging in to ACR..." -ForegroundColor Yellow
try {
    az acr login --name $AcrName
    Write-Host "  ✓ Logged in to ACR" -ForegroundColor Green
}
catch {
    Write-Host "  ✗ Failed to login to ACR!" -ForegroundColor Red
    Write-Host "  Make sure you're logged in to Azure: az login" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Push to ACR
Write-Host "[5/6] Pushing image to ACR..." -ForegroundColor Yellow
try {
    docker push $acrImage
    if ($ImageTag -ne "latest") {
        docker push $acrImageLatest
    }
    Write-Host "  ✓ Image pushed successfully" -ForegroundColor Green
}
catch {
    Write-Host "  ✗ Failed to push image!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 6: Verify
Write-Host "[6/6] Verifying image in ACR..." -ForegroundColor Yellow
try {
    az acr repository show --name $AcrName --repository $ImageName --output table
    Write-Host "  ✓ Image verified in ACR" -ForegroundColor Green
}
catch {
    Write-Host "  ⚠ Could not verify image (but push was successful)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Build & Push Complete!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Image Details:" -ForegroundColor Yellow
Write-Host "  ACR: $AcrName.azurecr.io" -ForegroundColor Gray
Write-Host "  Repository: $ImageName" -ForegroundColor Gray
Write-Host "  Tag: $ImageTag" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Update k8s/deployment.yaml with image: $acrImage" -ForegroundColor Gray
Write-Host "  2. Deploy to Kubernetes: kubectl apply -f k8s/deployment.yaml" -ForegroundColor Gray
Write-Host "  3. Check deployment: kubectl get pods" -ForegroundColor Gray
Write-Host ""
