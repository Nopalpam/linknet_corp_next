# Health Check & Azure Key Vault - Quick Reference

## 🚀 Quick Start

### Local Development (Tanpa Azure Key Vault)

```powershell
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env - set minimal required vars
# DATABASE_URL=postgresql://...
# JWT_SECRET=your-secret-min-32-chars

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# 4. Test health endpoints
curl http://localhost:5000/health
curl http://localhost:5000/ready
```

### Production (Dengan Azure Key Vault)

```powershell
# Set environment variables
$env:AZURE_KEY_VAULT_URL="https://your-vault.vault.azure.net/"
$env:NODE_ENV="production"

# Start server
npm start
```

---

## 📍 Health Check Endpoints

### 1. Basic Health Check
**Endpoint:** `GET /health`  
**Purpose:** Liveness probe untuk Kubernetes  
**Response Time:** < 10ms

```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-19T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0"
}
```

### 2. Readiness Check
**Endpoint:** `GET /ready`  
**Purpose:** Readiness probe - check dependencies  
**Checks:** Database, Cache, Key Vault

```bash
curl http://localhost:5000/ready
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-19T10:30:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "up",
      "responseTime": 15,
      "message": "Database connection successful"
    },
    "cache": {
      "status": "up",
      "stats": {...},
      "message": "Cache operational with 5 keys"
    },
    "keyVault": {
      "status": "up",
      "message": "Key Vault connection successful"
    }
  }
}
```

### 3. Environment Check
**Endpoint:** `GET /env-check`  
**Purpose:** Validate Azure Key Vault connection  
**Use:** Debugging & deployment validation

```bash
curl http://localhost:5000/env-check
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-11-19T10:30:00.000Z",
  "environment": "production",
  "environmentVariables": {
    "NODE_ENV": true,
    "DATABASE_URL": true,
    "JWT_SECRET": true,
    "CORS_ORIGIN": true
  },
  "azureKeyVault": {
    "enabled": true,
    "configured": {
      "AZURE_KEY_VAULT_URL": true,
      "AZURE_TENANT_ID": true,
      "AZURE_CLIENT_ID": true,
      "AZURE_CLIENT_SECRET": true
    },
    "connectionTest": {
      "status": "success",
      "message": "Key Vault connection successful"
    }
  },
  "cache": {
    "status": "operational",
    "cachedSecrets": 5,
    "stats": {...}
  }
}
```

### 4. Detailed Health Check
**Endpoint:** `GET /health/detailed`  
**Purpose:** Comprehensive diagnostics  
**Use:** Monitoring & debugging

```bash
curl http://localhost:5000/health/detailed
```

---

## 🔐 Azure Key Vault Service

### Basic Usage

```typescript
import azureKeyVaultService from '@services/azureKeyVault.service';

// Get single secret
const jwtSecret = await azureKeyVaultService.getSecret('jwt-secret', 'JWT_SECRET');

// Get multiple secrets
const secrets = await azureKeyVaultService.getSecrets([
  { keyVaultName: 'database-url', envVarName: 'DATABASE_URL' },
  { keyVaultName: 'jwt-secret', envVarName: 'JWT_SECRET' },
  { keyVaultName: 'api-key', envVarName: 'API_KEY' }
]);

console.log(secrets.DATABASE_URL);
console.log(secrets.JWT_SECRET);
```

### Check Health

```typescript
const health = await azureKeyVaultService.checkHealth();
console.log(health.isHealthy); // true/false
console.log(health.message);   // Status message
```

### Cache Management

```typescript
// Clear specific secret from cache
azureKeyVaultService.clearCache('jwt-secret');

// Clear all cached secrets
azureKeyVaultService.clearCache();

// Get cache statistics
const stats = azureKeyVaultService.getCacheStats();
console.log(stats.keys);   // Array of cached keys
console.log(stats.stats);  // Cache statistics
```

### Check if Enabled

```typescript
if (azureKeyVaultService.isKeyVaultEnabled()) {
  console.log('Using Azure Key Vault');
} else {
  console.log('Using local .env file');
}
```

---

## 🔧 Environment Validator

### Validate at Startup

```typescript
import { validateEnvironmentAtStartup } from '@middleware/environmentValidator';

// Call before starting server
validateEnvironmentAtStartup();
```

**Output:**
```
╔══════════════════════════════════════════════════════════════╗
║              Environment Configuration                       ║
╠══════════════════════════════════════════════════════════════╣
║  Environment: production                                     ║
║  Port: 5000                                                  ║
║  Database: ✓ Configured                                      ║
║  JWT Secret: ✓ Configured                                    ║
║  Key Vault: ✓ Enabled                                        ║
╚══════════════════════════════════════════════════════════════╝

✅ Environment validation passed
```

### Get Environment Variable Safely

```typescript
import { getEnvVar } from '@middleware/environmentValidator';

// With fallback
const port = getEnvVar('PORT', '5000');

// Without fallback (throws if missing)
const jwtSecret = getEnvVar('JWT_SECRET');
```

### Programmatic Validation

```typescript
import { validateEnvironment } from '@middleware/environmentValidator';

const result = validateEnvironment();

if (!result.isValid) {
  console.error('Errors:', result.errors);
}

if (result.warnings.length > 0) {
  console.warn('Warnings:', result.warnings);
}

console.log('Variables:', result.variables);
```

---

## 🐳 Docker Usage

### Build Image

```powershell
docker build -t linknetcorp-backend:latest .
```

### Run Container

```powershell
# With environment variables
docker run -d \
  --name linknetcorp-backend \
  -p 5000:5000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="your-secret" \
  linknetcorp-backend:latest

# With .env file
docker run -d \
  --name linknetcorp-backend \
  -p 5000:5000 \
  --env-file .env \
  linknetcorp-backend:latest
```

### Check Health

```powershell
# Check container health status
docker ps

# Test health endpoint
curl http://localhost:5000/health

# View logs
docker logs linknetcorp-backend

# Execute command inside container
docker exec -it linknetcorp-backend sh
```

### Health Check in Docker

Docker akan otomatis run health check setiap 30 detik:
```dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1
```

---

## ☸️ Kubernetes Usage

### Deploy to Kubernetes

```powershell
# Apply deployment
kubectl apply -f k8s/deployment.yaml

# Check status
kubectl get pods
kubectl get deployments
```

### Check Health in Kubernetes

```powershell
# Get pod name
$POD_NAME = kubectl get pods -l app=linknetcorp-backend -o jsonpath="{.items[0].metadata.name}"

# Port forward
kubectl port-forward $POD_NAME 5000:5000

# Test endpoints
curl http://localhost:5000/health
curl http://localhost:5000/ready
curl http://localhost:5000/env-check
```

### View Logs

```powershell
# Stream logs
kubectl logs -f $POD_NAME

# Last 100 lines
kubectl logs --tail=100 $POD_NAME

# Previous container (if crashed)
kubectl logs -p $POD_NAME
```

### Probe Configuration

```yaml
# Liveness Probe
livenessProbe:
  httpGet:
    path: /health
    port: 5000
  initialDelaySeconds: 30
  periodSeconds: 30

# Readiness Probe
readinessProbe:
  httpGet:
    path: /ready
    port: 5000
  initialDelaySeconds: 20
  periodSeconds: 10
```

---

## 🔑 Secret Naming Convention

### Azure Key Vault (kebab-case)
```
database-url
jwt-secret
api-key
smtp-password
redis-password
```

### Environment Variables (UPPER_SNAKE_CASE)
```
DATABASE_URL
JWT_SECRET
API_KEY
SMTP_PASSWORD
REDIS_PASSWORD
```

### Mapping Example

```typescript
await azureKeyVaultService.getSecret(
  'database-url',    // Key Vault name (kebab-case)
  'DATABASE_URL'     // Env var name (UPPER_SNAKE_CASE)
);
```

---

## ⚡ Performance Tips

### 1. Secret Caching
- Secrets cached for 5 minutes
- Reduces Key Vault API calls
- Automatic cache invalidation

### 2. Fallback Strategy
```
1. Check in-memory cache
2. If not found, fetch from Key Vault
3. If Key Vault fails, use .env file
4. Cache the result
```

### 3. Parallel Secret Fetching
```typescript
// ✅ Good - fetch in parallel
const secrets = await azureKeyVaultService.getSecrets([
  { keyVaultName: 'database-url', envVarName: 'DATABASE_URL' },
  { keyVaultName: 'jwt-secret', envVarName: 'JWT_SECRET' }
]);

// ❌ Bad - sequential fetching
const dbUrl = await azureKeyVaultService.getSecret('database-url');
const jwtSecret = await azureKeyVaultService.getSecret('jwt-secret');
```

---

## 🚨 Troubleshooting

### Issue: Health check returns 503

**Cause:** Database or Key Vault tidak accessible

**Solution:**
```powershell
# Check readiness endpoint
curl http://localhost:5000/ready

# Check detailed health
curl http://localhost:5000/health/detailed

# View logs
docker logs linknetcorp-backend
# or
kubectl logs $POD_NAME
```

### Issue: Key Vault access denied

**Cause:** Managed Identity tidak configured correctly

**Solution:**
```powershell
# Check Key Vault URL
echo $env:AZURE_KEY_VAULT_URL

# Test with env-check endpoint
curl http://localhost:5000/env-check

# Verify Managed Identity has Key Vault permissions
az keyvault show --name <vault-name> --query properties.accessPolicies
```

### Issue: Environment validation failed

**Cause:** Required environment variables missing

**Solution:**
1. Check `.env` file exists
2. Verify required variables are set
3. Check environment validator rules in `src/middleware/environmentValidator.ts`

```powershell
# Test validation
curl http://localhost:5000/env-check
```

---

## 📊 Monitoring

### Key Metrics to Monitor

1. **Health Endpoint Response Time**
   - Target: < 100ms
   - Alert if > 1000ms

2. **Database Connection Time**
   - Check via `/ready` endpoint
   - Target: < 50ms

3. **Key Vault Cache Hit Rate**
   - Check via `/health/detailed`
   - Target: > 90%

4. **Pod Restart Count**
   - Monitor in Kubernetes
   - Alert if > 3 restarts in 5 minutes

### Azure Monitor Integration

```typescript
// TODO: Add Application Insights integration
import appInsights from 'applicationinsights';

appInsights.setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setAutoCollectRequests(true)
  .setAutoCollectPerformance(true)
  .setAutoCollectExceptions(true)
  .start();
```

---

## 📝 Best Practices

1. **Always validate environment at startup**
   ```typescript
   validateEnvironmentAtStartup();
   ```

2. **Use health checks for all dependencies**
   - Database
   - Cache
   - External APIs
   - Key Vault

3. **Set appropriate timeouts**
   - Health check: 10s
   - Readiness check: 5s
   - Startup check: 30s

4. **Monitor cache performance**
   ```typescript
   const stats = azureKeyVaultService.getCacheStats();
   console.log('Cache hit rate:', stats.stats.hits / stats.stats.keys);
   ```

5. **Use Managed Identity in production**
   - No credentials in code
   - Automatic token rotation
   - Better security

6. **Implement graceful shutdown**
   ```typescript
   process.on('SIGTERM', async () => {
     await prisma.$disconnect();
     process.exit(0);
   });
   ```

---

## 🔗 Related Documentation

- [AZURE_DEPLOYMENT_GUIDE.md](./AZURE_DEPLOYMENT_GUIDE.md) - Full deployment guide
- [README.md](./README.md) - Project overview
- [DATABASE.md](./DATABASE.md) - Database documentation

---

## 📞 Support

Untuk bantuan lebih lanjut:
1. Check logs: `docker logs` atau `kubectl logs`
2. Test endpoints: `/health`, `/ready`, `/env-check`
3. Review environment variables
4. Contact DevOps team
