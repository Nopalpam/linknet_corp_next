# Deploy to Azure Kubernetes Service
# Usage: .\deploy-to-aks.ps1 -ResourceGroup "linknetcorp-rg" -AksName "linknetcorp-aks"

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroup,
    
    [Parameter(Mandatory=$true)]
    [string]$AksName,
    
    [Parameter(Mandatory=$false)]
    [switch]$UseKeyVaultCsi = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipMigration = $false
)

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Deploy to Azure Kubernetes Service" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $ResourceGroup" -ForegroundColor Gray
Write-Host "  AKS Cluster: $AksName" -ForegroundColor Gray
Write-Host "  Use Key Vault CSI: $UseKeyVaultCsi" -ForegroundColor Gray
Write-Host "  Skip Migration: $SkipMigration" -ForegroundColor Gray
Write-Host ""

# Step 1: Get AKS credentials
Write-Host "[1/5] Getting AKS credentials..." -ForegroundColor Yellow
try {
    az aks get-credentials --resource-group $ResourceGroup --name $AksName --overwrite-existing
    Write-Host "  ✓ AKS credentials retrieved" -ForegroundColor Green
}
catch {
    Write-Host "  ✗ Failed to get AKS credentials!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 2: Verify kubectl connection
Write-Host "[2/5] Verifying kubectl connection..." -ForegroundColor Yellow
try {
    kubectl cluster-info | Out-Null
    $nodes = kubectl get nodes --no-headers | Measure-Object
    Write-Host "  ✓ Connected to AKS cluster" -ForegroundColor Green
    Write-Host "  ✓ Nodes available: $($nodes.Count)" -ForegroundColor Green
}
catch {
    Write-Host "  ✗ Failed to connect to AKS cluster!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Apply Kubernetes manifests
Write-Host "[3/5] Deploying application..." -ForegroundColor Yellow
try {
    if ($UseKeyVaultCsi) {
        Write-Host "  Using Key Vault CSI driver configuration..." -ForegroundColor Gray
        kubectl apply -f k8s/keyvault-csi.yaml
    }
    else {
        Write-Host "  Using standard deployment..." -ForegroundColor Gray
        kubectl apply -f k8s/deployment.yaml
    }
    Write-Host "  ✓ Deployment applied" -ForegroundColor Green
}
catch {
    Write-Host "  ✗ Failed to apply deployment!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Wait for deployment
Write-Host "[4/5] Waiting for deployment to be ready..." -ForegroundColor Yellow
Write-Host "  This may take a few minutes..." -ForegroundColor Gray
try {
    kubectl rollout status deployment/linknetcorp-backend --timeout=5m
    Write-Host "  ✓ Deployment is ready" -ForegroundColor Green
}
catch {
    Write-Host "  ✗ Deployment failed or timed out!" -ForegroundColor Red
    Write-Host "  Check pod status: kubectl get pods" -ForegroundColor Yellow
    Write-Host "  Check pod logs: kubectl logs -l app=linknetcorp-backend" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Step 5: Run database migration
if (-not $SkipMigration) {
    Write-Host "[5/5] Running database migration..." -ForegroundColor Yellow
    try {
        $podName = kubectl get pods -l app=linknetcorp-backend -o jsonpath="{.items[0].metadata.name}"
        Write-Host "  Pod: $podName" -ForegroundColor Gray
        
        kubectl exec -it $podName -- npx prisma migrate deploy
        Write-Host "  ✓ Migration completed" -ForegroundColor Green
    }
    catch {
        Write-Host "  ⚠ Migration failed or skipped" -ForegroundColor Yellow
        Write-Host "  You can run it manually later: kubectl exec -it <pod-name> -- npx prisma migrate deploy" -ForegroundColor Yellow
    }
}
else {
    Write-Host "[5/5] Skipping database migration..." -ForegroundColor Yellow
}
Write-Host ""

# Display deployment info
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Deployment Complete!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Deployment Status:" -ForegroundColor Yellow
kubectl get deployments -l app=linknetcorp-backend
Write-Host ""

Write-Host "Pod Status:" -ForegroundColor Yellow
kubectl get pods -l app=linknetcorp-backend
Write-Host ""

Write-Host "Service Status:" -ForegroundColor Yellow
kubectl get services -l app=linknetcorp-backend
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Check pod logs: kubectl logs -f <pod-name>" -ForegroundColor Gray
Write-Host "  2. Test health: kubectl port-forward <pod-name> 5000:5000" -ForegroundColor Gray
Write-Host "     Then: curl http://localhost:5000/health" -ForegroundColor Gray
Write-Host "  3. Monitor: kubectl get pods -w" -ForegroundColor Gray
Write-Host ""

# Test health endpoint if possible
$podName = kubectl get pods -l app=linknetcorp-backend -o jsonpath="{.items[0].metadata.name}" 2>$null
if ($podName) {
    Write-Host "Testing Health Endpoint:" -ForegroundColor Yellow
    Write-Host "  Starting port-forward in background..." -ForegroundColor Gray
    
    $job = Start-Job -ScriptBlock {
        param($pod)
        kubectl port-forward $pod 5000:5000
    } -ArgumentList $podName
    
    Start-Sleep -Seconds 3
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/health" -TimeoutSec 5
        Write-Host "  ✓ Health check passed!" -ForegroundColor Green
        Write-Host "  Status: $($response.status)" -ForegroundColor Gray
    }
    catch {
        Write-Host "  ⚠ Could not test health endpoint automatically" -ForegroundColor Yellow
        Write-Host "  Test manually using port-forward" -ForegroundColor Yellow
    }
    finally {
        Stop-Job -Job $job
        Remove-Job -Job $job
    }
}
Write-Host ""
