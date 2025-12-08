# Azure Deployment Guide - Kubernetes

Panduan lengkap untuk deploy LinkNet Corp Backend ke Azure Kubernetes Service (AKS) dengan Azure Key Vault integration.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Azure Resources Setup](#azure-resources-setup)
3. [Local Development](#local-development)
4. [Docker Build & Test](#docker-build--test)
5. [Kubernetes Deployment](#kubernetes-deployment)
6. [Azure Key Vault Integration](#azure-key-vault-integration)
7. [Health Checks & Monitoring](#health-checks--monitoring)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [Docker](https://www.docker.com/get-started)
- [Node.js 18+](https://nodejs.org/)
- [Helm](https://helm.sh/docs/intro/install/) (optional, for CSI driver)

### Azure Resources
- Azure Subscription
- Resource Group
- Azure Container Registry (ACR)
- Azure Kubernetes Service (AKS)
- Azure Key Vault
- Azure Database for PostgreSQL

---

## Azure Resources Setup

### 1. Login to Azure
```powershell
az login
az account set --subscription <YOUR_SUBSCRIPTION_ID>
```

### 2. Create Resource Group
```powershell
$RESOURCE_GROUP = "linknetcorp-rg"
$LOCATION = "southeastasia"

az group create --name $RESOURCE_GROUP --location $LOCATION
```

### 3. Create Azure Container Registry (ACR)
```powershell
$ACR_NAME = "linknetcorpacr"

az acr create `
  --resource-group $RESOURCE_GROUP `
  --name $ACR_NAME `
  --sku Standard `
  --location $LOCATION

# Login to ACR
az acr login --name $ACR_NAME
```

### 4. Create AKS Cluster
```powershell
$AKS_NAME = "linknetcorp-aks"

az aks create `
  --resource-group $RESOURCE_GROUP `
  --name $AKS_NAME `
  --node-count 3 `
  --node-vm-size Standard_D2s_v3 `
  --enable-managed-identity `
  --enable-workload-identity `
  --enable-oidc-issuer `
  --network-plugin azure `
  --generate-ssh-keys `
  --attach-acr $ACR_NAME

# Get AKS credentials
az aks get-credentials --resource-group $RESOURCE_GROUP --name $AKS_NAME
```

### 5. Create Azure Database for PostgreSQL
```powershell
$POSTGRES_SERVER = "linknetcorp-db"
$POSTGRES_USER = "linknetadmin"
$POSTGRES_PASSWORD = "<GENERATE_STRONG_PASSWORD>"

az postgres flexible-server create `
  --resource-group $RESOURCE_GROUP `
  --name $POSTGRES_SERVER `
  --location $LOCATION `
  --admin-user $POSTGRES_USER `
  --admin-password $POSTGRES_PASSWORD `
  --sku-name Standard_D2s_v3 `
  --storage-size 32 `
  --version 14

# Create database
az postgres flexible-server db create `
  --resource-group $RESOURCE_GROUP `
  --server-name $POSTGRES_SERVER `
  --database-name linknetcorp_db

# Allow Azure services
az postgres flexible-server firewall-rule create `
  --resource-group $RESOURCE_GROUP `
  --name $POSTGRES_SERVER `
  --rule-name AllowAzureServices `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0
```

### 6. Create Azure Key Vault
```powershell
$KEYVAULT_NAME = "linknetcorp-kv"

az keyvault create `
  --name $KEYVAULT_NAME `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --enable-rbac-authorization false

# Store secrets in Key Vault
$DATABASE_URL = "postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_SERVER}.postgres.database.azure.com:5432/linknetcorp_db?schema=public&sslmode=require"

az keyvault secret set --vault-name $KEYVAULT_NAME --name "database-url" --value $DATABASE_URL
az keyvault secret set --vault-name $KEYVAULT_NAME --name "jwt-secret" --value "<GENERATE_JWT_SECRET>"
```

### 7. Setup Managed Identity & Permissions
```powershell
# Get AKS OIDC Issuer URL
$AKS_OIDC_ISSUER = az aks show --resource-group $RESOURCE_GROUP --name $AKS_NAME --query "oidcIssuerProfile.issuerUrl" -o tsv

# Create User Assigned Managed Identity
$IDENTITY_NAME = "linknetcorp-backend-identity"

az identity create --name $IDENTITY_NAME --resource-group $RESOURCE_GROUP --location $LOCATION

$IDENTITY_CLIENT_ID = az identity show --name $IDENTITY_NAME --resource-group $RESOURCE_GROUP --query clientId -o tsv
$IDENTITY_OBJECT_ID = az identity show --name $IDENTITY_NAME --resource-group $RESOURCE_GROUP --query principalId -o tsv

# Grant Key Vault permissions to Managed Identity
az keyvault set-policy `
  --name $KEYVAULT_NAME `
  --object-id $IDENTITY_OBJECT_ID `
  --secret-permissions get list

# Create federated credential for workload identity
az identity federated-credential create `
  --name "linknetcorp-backend-federated-credential" `
  --identity-name $IDENTITY_NAME `
  --resource-group $RESOURCE_GROUP `
  --issuer $AKS_OIDC_ISSUER `
  --subject "system:serviceaccount:default:linknetcorp-backend-sa"
```

---

## Local Development

### 1. Setup Environment Variables
```powershell
# Copy .env.example to .env
cp .env.example .env

# Edit .env with your local configuration
# No need to configure Azure Key Vault for local development
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Setup Database
```powershell
npm run db:push
npm run db:seed
```

### 4. Start Development Server
```powershell
npm run dev
```

### 5. Test Health Endpoints
```powershell
# Basic health check
curl http://localhost:5000/health

# Readiness check
curl http://localhost:5000/ready

# Environment check
curl http://localhost:5000/env-check

# Detailed health
curl http://localhost:5000/health/detailed
```

---

## Docker Build & Test

### 1. Build Docker Image
```powershell
cd backend

# Build image
docker build -t linknetcorp-backend:latest .

# Tag for ACR
docker tag linknetcorp-backend:latest ${ACR_NAME}.azurecr.io/linknetcorp-backend:latest
```

### 2. Test Docker Image Locally
```powershell
# Run container
docker run -d `
  --name linknetcorp-backend-test `
  -p 5000:5000 `
  -e DATABASE_URL="<YOUR_LOCAL_DATABASE_URL>" `
  -e JWT_SECRET="test-secret-key-minimum-32-chars" `
  linknetcorp-backend:latest

# Check health
curl http://localhost:5000/health

# View logs
docker logs linknetcorp-backend-test

# Stop and remove
docker stop linknetcorp-backend-test
docker rm linknetcorp-backend-test
```

### 3. Push to Azure Container Registry
```powershell
# Login to ACR
az acr login --name $ACR_NAME

# Push image
docker push ${ACR_NAME}.azurecr.io/linknetcorp-backend:latest
```

---

## Kubernetes Deployment

### 1. Update Kubernetes Manifests

Edit `k8s/deployment.yaml`:
- Replace `<YOUR_ACR_NAME>` with your ACR name
- Replace `<YOUR_VAULT_NAME>` with your Key Vault name

Edit `k8s/keyvault-csi.yaml`:
- Replace `<YOUR_MANAGED_IDENTITY_CLIENT_ID>` with `$IDENTITY_CLIENT_ID`
- Replace `<YOUR_AZURE_TENANT_ID>` with your tenant ID
- Replace `<YOUR_KEY_VAULT_NAME>` with your vault name

### 2. Create Kubernetes Secrets (Option 1: Manual)
```powershell
# Create secrets from Key Vault values
$DATABASE_URL_B64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($DATABASE_URL))
$JWT_SECRET_B64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("<YOUR_JWT_SECRET>"))

# Apply secrets
kubectl create secret generic linknetcorp-backend-secrets `
  --from-literal=database-url=$DATABASE_URL `
  --from-literal=jwt-secret="<YOUR_JWT_SECRET>"
```

### 3. Install CSI Driver (Option 2: Using CSI Driver)
```powershell
# Add Helm repository
helm repo add csi-secrets-store-provider-azure https://azure.github.io/secrets-store-csi-driver-provider-azure/charts
helm repo update

# Install CSI driver
helm install csi-secrets-store-provider-azure/csi-secrets-store-provider-azure `
  --generate-name `
  --namespace kube-system
```

### 4. Deploy Application
```powershell
# Apply ConfigMap and Secrets
kubectl apply -f k8s/deployment.yaml

# Or use CSI driver version
kubectl apply -f k8s/keyvault-csi.yaml

# Check deployment status
kubectl get deployments
kubectl get pods
kubectl get services
```

### 5. Run Database Migrations
```powershell
# Get a pod name
$POD_NAME = kubectl get pods -l app=linknetcorp-backend -o jsonpath="{.items[0].metadata.name}"

# Run migrations
kubectl exec -it $POD_NAME -- npx prisma migrate deploy

# Or run seed
kubectl exec -it $POD_NAME -- npx prisma db seed
```

### 6. Expose Service (Optional - for testing)
```powershell
# Create LoadBalancer service for external access
kubectl expose deployment linknetcorp-backend `
  --type=LoadBalancer `
  --name=linknetcorp-backend-lb `
  --port=80 `
  --target-port=5000

# Get external IP
kubectl get service linknetcorp-backend-lb
```

---

## Azure Key Vault Integration

### How It Works

1. **Local Development**: Uses `.env` file, no Key Vault needed
2. **Production (AKS)**: Uses Azure Managed Identity to fetch secrets from Key Vault

### Adding New Secrets

#### 1. Add to Key Vault
```powershell
az keyvault secret set --vault-name $KEYVAULT_NAME --name "api-key" --value "<YOUR_API_KEY>"
```

#### 2. Update Application Code
```typescript
// In your service or controller
import azureKeyVaultService from '@services/azureKeyVault.service';

// Fetch secret
const apiKey = await azureKeyVaultService.getSecret('api-key', 'API_KEY');
```

#### 3. Update Environment Validator (Optional)
Add to `src/middleware/environmentValidator.ts`:
```typescript
{
  name: 'API_KEY',
  required: false,
  description: 'External API Key',
}
```

#### 4. Update CSI Driver Config (if using CSI)
Add to `k8s/keyvault-csi.yaml`:
```yaml
- |
  objectName: api-key
  objectType: secret
  objectVersion: ""
```

### Secret Caching

- Secrets are cached for **5 minutes** (configurable)
- Cache reduces Key Vault API calls
- Automatic fallback to `.env` if Key Vault unavailable

---

## Health Checks & Monitoring

### Health Endpoints

| Endpoint | Purpose | K8s Probe |
|----------|---------|-----------|
| `GET /health` | Basic liveness check | Liveness |
| `GET /ready` | Readiness with dependencies | Readiness |
| `GET /env-check` | Validate Key Vault connection | Manual |
| `GET /health/detailed` | Comprehensive diagnostics | Manual |

### Kubernetes Probes Configuration

```yaml
# Liveness Probe - checks if container is alive
livenessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 30
  failureThreshold: 3

# Readiness Probe - checks if ready to serve traffic
readinessProbe:
  httpGet:
    path: /ready
    port: 5000
  initialDelaySeconds: 20
  periodSeconds: 10
  failureThreshold: 3

# Startup Probe - checks if app has started
startupProbe:
  httpGet:
    path: /health
    port: 5000
  periodSeconds: 10
  failureThreshold: 30
```

### Monitoring Commands
```powershell
# Check pod health
kubectl get pods

# View pod logs
kubectl logs -f <POD_NAME>

# Describe pod (shows probe failures)
kubectl describe pod <POD_NAME>

# Test health endpoint
kubectl port-forward <POD_NAME> 5000:5000
curl http://localhost:5000/ready
```

---

## Troubleshooting

### Pod Not Starting

```powershell
# Check pod status
kubectl describe pod <POD_NAME>

# Check logs
kubectl logs <POD_NAME>

# Check events
kubectl get events --sort-by='.lastTimestamp'
```

**Common Issues:**
- **ImagePullBackOff**: ACR not accessible → Check ACR attachment
- **CrashLoopBackOff**: App crashing → Check logs and env vars
- **Pending**: Resource constraints → Check node capacity

### Database Connection Failed

```powershell
# Test database connection from pod
kubectl exec -it <POD_NAME> -- sh
# Inside pod:
apk add postgresql-client
psql $DATABASE_URL
```

**Solutions:**
- Check DATABASE_URL format
- Verify firewall rules allow AKS
- Ensure SSL mode is set correctly

### Key Vault Access Denied

```powershell
# Check Managed Identity assignment
az identity show --name $IDENTITY_NAME --resource-group $RESOURCE_GROUP

# Check Key Vault access policies
az keyvault show --name $KEYVAULT_NAME --query properties.accessPolicies
```

**Solutions:**
- Verify workload identity setup
- Check federated credential configuration
- Ensure service account annotations are correct

### Health Check Failing

```powershell
# Test health endpoint directly
kubectl port-forward <POD_NAME> 5000:5000
curl http://localhost:5000/health
curl http://localhost:5000/ready
```

**Solutions:**
- Check if database is accessible
- Verify environment variables
- Check application logs for errors

### Secrets Not Loading

```powershell
# Check if secrets exist
kubectl get secrets

# Describe secret
kubectl describe secret linknetcorp-backend-secrets

# Check CSI driver (if using)
kubectl get secretproviderclass
kubectl describe secretproviderclass linknetcorp-backend-keyvault
```

---

## Production Checklist

- [ ] Secrets stored in Azure Key Vault
- [ ] Database connection string using SSL
- [ ] JWT secret is strong (32+ characters)
- [ ] CORS_ORIGIN set to production domain
- [ ] Rate limiting configured appropriately
- [ ] Health checks responding correctly
- [ ] Pod resources (CPU/Memory) limits set
- [ ] HPA configured for autoscaling
- [ ] Logs being collected (Azure Monitor)
- [ ] Alerts configured for critical errors
- [ ] Backup strategy for database
- [ ] SSL/TLS certificates configured
- [ ] Network policies applied
- [ ] RBAC configured correctly

---

## Useful Commands

```powershell
# Scale deployment
kubectl scale deployment linknetcorp-backend --replicas=5

# Update image
kubectl set image deployment/linknetcorp-backend backend=${ACR_NAME}.azurecr.io/linknetcorp-backend:v2

# Restart deployment
kubectl rollout restart deployment linknetcorp-backend

# View rollout history
kubectl rollout history deployment linknetcorp-backend

# Rollback deployment
kubectl rollout undo deployment linknetcorp-backend

# Port forward for testing
kubectl port-forward service/linknetcorp-backend-service 5000:80

# Execute command in pod
kubectl exec -it <POD_NAME> -- sh

# View resource usage
kubectl top pods
kubectl top nodes
```

---

## Additional Resources

- [Azure Kubernetes Service Documentation](https://docs.microsoft.com/azure/aks/)
- [Azure Key Vault Documentation](https://docs.microsoft.com/azure/key-vault/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

## Support

Untuk pertanyaan atau issues, hubungi tim development atau buat issue di repository.
