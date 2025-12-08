# 🚀 Quick Reference Card - Health & Key Vault

## 📍 Health Endpoints

| Endpoint | Purpose | K8s Probe | Response |
|----------|---------|-----------|----------|
| `GET /health` | Basic liveness | Liveness | < 10ms |
| `GET /ready` | Dependencies check | Readiness | < 100ms |
| `GET /env-check` | Config validation | Manual | Variable |
| `GET /health/detailed` | Full diagnostics | Manual | Variable |

## 🔑 Environment Variables

### Required
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=min-32-chars
```

### Azure Key Vault (Optional)
```bash
AZURE_KEY_VAULT_URL=https://vault.vault.azure.net/
AZURE_TENANT_ID=...      # For service principal
AZURE_CLIENT_ID=...      # For service principal  
AZURE_CLIENT_SECRET=...  # For service principal
```

## 💻 NPM Commands

```bash
# Development
npm run dev              # Start dev server
npm run test:health      # Test health endpoints

# Database
npm run db:push          # Push schema changes
npm run db:seed          # Seed data
npm run db:studio        # Open GUI

# Docker
npm run docker:build     # Build image
npm run docker:run       # Run container
npm run docker:logs      # View logs
npm run docker:stop      # Stop & remove

# Production
npm run build            # Build TypeScript
npm start                # Start production
```

## 🐳 Docker Commands

```powershell
# Build
docker build -t linknetcorp-backend:latest .

# Run
docker run -d \
  --name linknetcorp-backend \
  -p 5000:5000 \
  --env-file .env \
  linknetcorp-backend:latest

# Check health
docker ps                # Shows health status
curl http://localhost:5000/health

# Logs
docker logs -f linknetcorp-backend

# Stop
docker stop linknetcorp-backend
docker rm linknetcorp-backend
```

## ☸️ Kubernetes Commands

```powershell
# Deploy
kubectl apply -f k8s/deployment.yaml

# Status
kubectl get pods
kubectl get deployments
kubectl get services

# Logs
kubectl logs -f <pod-name>

# Describe
kubectl describe pod <pod-name>

# Port Forward
kubectl port-forward <pod-name> 5000:5000

# Execute
kubectl exec -it <pod-name> -- sh

# Scale
kubectl scale deployment linknetcorp-backend --replicas=5

# Restart
kubectl rollout restart deployment linknetcorp-backend
```

## 🔧 Azure CLI Commands

```powershell
# Login
az login

# ACR Login
az acr login --name <acr-name>

# Push Image
docker push <acr-name>.azurecr.io/linknetcorp-backend:latest

# Get AKS Credentials
az aks get-credentials --resource-group <rg> --name <aks-name>

# Key Vault Secrets
az keyvault secret set --vault-name <vault> --name "secret-name" --value "value"
az keyvault secret show --vault-name <vault> --name "secret-name"
az keyvault secret list --vault-name <vault>
```

## 📜 PowerShell Scripts

```powershell
# Test Health
.\scripts\test-health.ps1

# Build & Push to ACR
.\scripts\build-and-push.ps1 -AcrName "linknetcorpacr" -ImageTag "v1.0.0"

# Deploy to AKS
.\scripts\deploy-to-aks.ps1 -ResourceGroup "linknetcorp-rg" -AksName "linknetcorp-aks"

# With Key Vault CSI
.\scripts\deploy-to-aks.ps1 -ResourceGroup "rg" -AksName "aks" -UseKeyVaultCsi

# Skip Migration
.\scripts\deploy-to-aks.ps1 -ResourceGroup "rg" -AksName "aks" -SkipMigration
```

## 🔍 Troubleshooting Commands

```powershell
# Check Pod Status
kubectl get pods
kubectl describe pod <pod-name>
kubectl logs <pod-name>
kubectl logs --previous <pod-name>  # Previous container

# Check Events
kubectl get events --sort-by='.lastTimestamp'

# Test Health
kubectl port-forward <pod-name> 5000:5000
curl http://localhost:5000/ready

# Database Connection
kubectl exec -it <pod-name> -- sh
# Inside pod:
npx prisma db push --skip-generate

# Check Secrets
kubectl get secrets
kubectl describe secret linknetcorp-backend-secrets

# Check ConfigMap
kubectl get configmaps
kubectl describe configmap linknetcorp-backend-config

# Resource Usage
kubectl top pods
kubectl top nodes
```

## 🎯 Common Workflows

### Local Development
```powershell
1. npm install
2. cp .env.example .env
3. # Edit .env
4. npm run db:push
5. npm run db:seed
6. npm run dev
7. npm run test:health
```

### Docker Testing
```powershell
1. npm run docker:build
2. npm run docker:run
3. curl http://localhost:5000/health
4. npm run docker:logs
5. npm run docker:stop
```

### Azure Deployment
```powershell
1. az login
2. .\scripts\build-and-push.ps1 -AcrName "acr" -ImageTag "v1.0.0"
3. # Update k8s/deployment.yaml image tag
4. .\scripts\deploy-to-aks.ps1 -ResourceGroup "rg" -AksName "aks"
5. kubectl get pods
6. kubectl logs -f <pod-name>
```

## 🔐 Secret Management

### Local (.env)
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
```

### Azure Key Vault
```powershell
# Store secret
az keyvault secret set --vault-name vault --name "database-url" --value "postgresql://..."

# Use in code
const dbUrl = await azureKeyVaultService.getSecret('database-url', 'DATABASE_URL');
```

### Kubernetes Secret
```powershell
# Create secret
kubectl create secret generic linknetcorp-backend-secrets \
  --from-literal=database-url="postgresql://..." \
  --from-literal=jwt-secret="your-secret"

# Or from file
kubectl apply -f k8s/deployment.yaml
```

## 📊 Health Check Responses

### /health - Success
```json
{
  "status": "healthy",
  "timestamp": "2025-11-19T10:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

### /ready - Success
```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "up", "responseTime": 15 },
    "cache": { "status": "up" },
    "keyVault": { "status": "up" }
  }
}
```

### /ready - Failure
```json
{
  "status": "unhealthy",
  "checks": {
    "database": { "status": "down", "message": "Connection refused" }
  }
}
```

## ⚡ Quick Tips

1. **Always test locally first**
   ```powershell
   npm run dev && npm run test:health
   ```

2. **Use semantic versioning**
   ```powershell
   v1.0.0, v1.0.1, v1.1.0
   ```

3. **Monitor pod health**
   ```powershell
   kubectl get pods -w
   ```

4. **Check logs on errors**
   ```powershell
   kubectl logs -f <pod-name>
   ```

5. **Port forward for debugging**
   ```powershell
   kubectl port-forward <pod-name> 5000:5000
   ```

## 📚 Documentation Files

| File | Description |
|------|-------------|
| [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) | Complete Azure deployment guide |
| [HEALTH_CHECK_GUIDE.md](./HEALTH_CHECK_GUIDE.md) | Health & Key Vault reference |
| [FEATURES.md](./FEATURES.md) | Feature list & roadmap |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Implementation details |
| [scripts/README.md](./scripts/README.md) | Script documentation |

## 🆘 Help

**Issue:** Can't connect to database  
**Fix:** Check DATABASE_URL in .env or Kubernetes secret

**Issue:** Key Vault access denied  
**Fix:** Check Managed Identity permissions

**Issue:** Pod not starting  
**Fix:** `kubectl describe pod <name>` and check events

**Issue:** Health check failing  
**Fix:** `kubectl logs <pod-name>` and check dependencies

---

**Print this page for quick reference!** 📄
