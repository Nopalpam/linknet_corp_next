# Deployment Scripts

Collection of PowerShell scripts untuk memudahkan testing, build, dan deployment.

## 📁 Available Scripts

### 1. test-health.ps1
Test semua health check endpoints.

**Usage:**
```powershell
.\scripts\test-health.ps1
```

**Tests:**
- `/health` - Basic liveness check
- `/ready` - Readiness check with dependencies
- `/env-check` - Environment and Key Vault validation
- `/health/detailed` - Comprehensive diagnostics

**Requirements:**
- Server harus running di `http://localhost:5000`
- Run `npm run dev` terlebih dahulu

---

### 2. build-and-push.ps1
Build Docker image dan push ke Azure Container Registry.

**Usage:**
```powershell
.\scripts\build-and-push.ps1 -AcrName "linknetcorpacr" -ImageTag "v1.0.0"

# Or use latest tag
.\scripts\build-and-push.ps1 -AcrName "linknetcorpacr"
```

**Parameters:**
- `-AcrName` (required): Azure Container Registry name
- `-ImageTag` (optional): Image tag, default "latest"
- `-ImageName` (optional): Image name, default "linknetcorp-backend"

**Requirements:**
- Docker Desktop running
- Azure CLI installed and logged in (`az login`)
- ACR already created in Azure

**Steps:**
1. Check Docker is running
2. Build Docker image
3. Tag for ACR
4. Login to ACR
5. Push to ACR
6. Verify image

---

### 3. deploy-to-aks.ps1
Deploy application ke Azure Kubernetes Service.

**Usage:**
```powershell
# Standard deployment
.\scripts\deploy-to-aks.ps1 -ResourceGroup "linknetcorp-rg" -AksName "linknetcorp-aks"

# With Key Vault CSI driver
.\scripts\deploy-to-aks.ps1 -ResourceGroup "linknetcorp-rg" -AksName "linknetcorp-aks" -UseKeyVaultCsi

# Skip database migration
.\scripts\deploy-to-aks.ps1 -ResourceGroup "linknetcorp-rg" -AksName "linknetcorp-aks" -SkipMigration
```

**Parameters:**
- `-ResourceGroup` (required): Azure Resource Group name
- `-AksName` (required): AKS cluster name
- `-UseKeyVaultCsi` (optional): Use Key Vault CSI driver configuration
- `-SkipMigration` (optional): Skip database migration

**Requirements:**
- Azure CLI installed and logged in
- kubectl installed
- AKS cluster already created
- Kubernetes manifests configured in `k8s/` folder

**Steps:**
1. Get AKS credentials
2. Verify kubectl connection
3. Apply Kubernetes manifests
4. Wait for deployment to be ready
5. Run database migration (unless skipped)
6. Display deployment status
7. Test health endpoint

---

## 🚀 Quick Start Workflow

### Local Development
```powershell
# 1. Start dev server
npm run dev

# 2. Test health endpoints
.\scripts\test-health.ps1
```

### Build & Deploy to Azure
```powershell
# 1. Build and push Docker image
.\scripts\build-and-push.ps1 -AcrName "linknetcorpacr" -ImageTag "v1.0.0"

# 2. Deploy to AKS
.\scripts\deploy-to-aks.ps1 -ResourceGroup "linknetcorp-rg" -AksName "linknetcorp-aks"

# 3. Verify deployment
kubectl get pods
kubectl logs -f <pod-name>
```

---

## 🔧 Script Customization

### Change Default Values

Edit scripts dan ubah default values:

**build-and-push.ps1:**
```powershell
[string]$ImageName = "linknetcorp-backend"  # Change image name
[string]$ImageTag = "latest"                # Change default tag
```

**deploy-to-aks.ps1:**
```powershell
[switch]$UseKeyVaultCsi = $false  # Enable CSI by default
[switch]$SkipMigration = $false   # Skip migration by default
```

### Add Custom Steps

Tambahkan custom steps di akhir script:

```powershell
# At the end of deploy-to-aks.ps1
Write-Host "Running custom post-deployment tasks..." -ForegroundColor Yellow
# Your custom commands here
```

---

## 📝 Best Practices

1. **Always test locally first**
   ```powershell
   npm run dev
   .\scripts\test-health.ps1
   ```

2. **Use semantic versioning for tags**
   ```powershell
   .\scripts\build-and-push.ps1 -AcrName "acr" -ImageTag "v1.2.3"
   ```

3. **Check deployment status**
   ```powershell
   kubectl get pods
   kubectl describe pod <pod-name>
   kubectl logs <pod-name>
   ```

4. **Monitor health endpoints**
   ```powershell
   kubectl port-forward <pod-name> 5000:5000
   curl http://localhost:5000/ready
   ```

---

## 🚨 Troubleshooting

### Script execution policy error
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Docker not running
```powershell
# Start Docker Desktop
# Then verify:
docker version
```

### Azure login required
```powershell
az login
az account set --subscription <subscription-id>
```

### kubectl not configured
```powershell
az aks get-credentials --resource-group <rg> --name <aks-name>
kubectl cluster-info
```

### Image pull error in AKS
```powershell
# Attach ACR to AKS
az aks update --name <aks-name> --resource-group <rg> --attach-acr <acr-name>
```

---

## 📚 Related Documentation

- [AZURE_DEPLOYMENT_GUIDE.md](../AZURE_DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [HEALTH_CHECK_GUIDE.md](../HEALTH_CHECK_GUIDE.md) - Health check documentation
- [README.md](../README.md) - Project overview

---

## 💡 Tips

- Use `-Verbose` flag untuk detailed output
- Save ACR name, resource group, dan AKS name di environment variables:
  ```powershell
  $env:ACR_NAME = "linknetcorpacr"
  $env:RESOURCE_GROUP = "linknetcorp-rg"
  $env:AKS_NAME = "linknetcorp-aks"
  
  .\scripts\build-and-push.ps1 -AcrName $env:ACR_NAME
  ```

- Create aliases untuk frequently used commands:
  ```powershell
  # Add to PowerShell profile
  function Deploy-LinkNetCorp {
      .\scripts\deploy-to-aks.ps1 -ResourceGroup "linknetcorp-rg" -AksName "linknetcorp-aks"
  }
  ```
