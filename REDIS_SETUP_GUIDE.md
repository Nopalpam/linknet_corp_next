# Redis Setup Guide for Windows

Redis diperlukan untuk activity logging queue system. Berikut cara install dan setup Redis di Windows.

## Option 1: Redis via WSL (Recommended)

### Install WSL
```powershell
# Run as Administrator
wsl --install
```

Restart komputer setelah install.

### Install Redis di WSL
```bash
# Buka WSL terminal
wsl

# Update packages
sudo apt-get update

# Install Redis
sudo apt-get install redis-server

# Start Redis
redis-server
```

### Test Connection
```bash
# Di terminal WSL lain
redis-cli ping
# Should return: PONG
```

### Auto-start Redis (Optional)
Edit `/etc/redis/redis.conf`:
```bash
sudo nano /etc/redis/redis.conf
```

Ubah:
```
supervised no
```
Menjadi:
```
supervised systemd
```

Start Redis sebagai service:
```bash
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## Option 2: Redis via Docker (Easiest)

### Install Docker Desktop
Download dari: https://www.docker.com/products/docker-desktop

### Run Redis Container
```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

### Stop Redis
```bash
docker stop redis
```

### Start Redis
```bash
docker start redis
```

### Check Status
```bash
docker ps
```

## Option 3: Redis for Windows (Native)

### Download Redis
1. Download dari: https://github.com/tporadowski/redis/releases
2. Extract ke folder (e.g., `C:\Redis`)

### Run Redis Server
```powershell
cd C:\Redis
.\redis-server.exe
```

### Test Connection
Buka PowerShell baru:
```powershell
cd C:\Redis
.\redis-cli.exe ping
# Should return: PONG
```

### Run as Windows Service (Optional)

Install sebagai service:
```powershell
# Run as Administrator
cd C:\Redis
.\redis-server.exe --service-install redis.windows.conf --loglevel verbose
```

Start service:
```powershell
.\redis-server.exe --service-start
```

Stop service:
```powershell
.\redis-server.exe --service-stop
```

## Verify Redis Installation

### Test dengan redis-cli
```bash
# Connect to Redis
redis-cli

# Set a value
> SET test "Hello Redis"
> OK

# Get the value
> GET test
> "Hello Redis"

# Check server info
> INFO server

# Exit
> exit
```

### Test dengan Node.js

Create file `test-redis.js`:
```javascript
const Redis = require('ioredis');

const redis = new Redis({
  host: 'localhost',
  port: 6379,
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
  
  redis.set('test', 'Hello from Node.js', (err, result) => {
    if (err) {
      console.error('❌ Error setting value:', err);
      return;
    }
    console.log('✅ Set value:', result);
    
    redis.get('test', (err, result) => {
      if (err) {
        console.error('❌ Error getting value:', err);
        return;
      }
      console.log('✅ Got value:', result);
      redis.disconnect();
    });
  });
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});
```

Run test:
```bash
node test-redis.js
```

## Configure Application

### Update .env
```env
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### For Remote Redis
```env
REDIS_ENABLED=true
REDIS_HOST=your-redis-host.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

## Redis GUI Tools (Optional)

### RedisInsight (Free)
- Download: https://redis.com/redis-enterprise/redis-insight/
- Features: Visual query builder, monitoring, CLI

### Another Redis Desktop Manager
- Download: https://github.com/qishibo/AnotherRedisDesktopManager
- Open source alternative

## Troubleshooting

### Redis not connecting
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solutions:**
1. Check if Redis is running: `redis-cli ping`
2. Check port: `netstat -ano | findstr :6379`
3. Restart Redis server
4. Check firewall settings

### Redis protected mode error
```
Error: DENIED Redis is running in protected mode
```

**Solution:**
Edit redis.conf:
```
protected-mode no
```

Or set password:
```
requirepass your-password
```

### Memory issues
```
Error: OOM command not allowed when used memory > 'maxmemory'
```

**Solution:**
Edit redis.conf:
```
maxmemory 256mb
maxmemory-policy allkeys-lru
```

### Port already in use
```
Error: Address already in use
```

**Solution:**
```powershell
# Find process using port 6379
netstat -ano | findstr :6379

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

## Best Practices

### Development
- Use Docker for easy setup/cleanup
- Or use WSL for Linux-like experience
- Keep Redis running in background

### Production
- Use Redis Cloud (managed service)
- Or setup Redis cluster for high availability
- Enable persistence (RDB/AOF)
- Set max memory limits
- Enable authentication

### Security
- Always use password in production
- Bind to specific IP (not 0.0.0.0)
- Use firewall rules
- Keep Redis updated

## Alternative: Development Without Redis

Jika tidak ingin install Redis untuk development, bisa modify `activityLogger.service.ts`:

```typescript
// Simple in-memory queue (NOT for production)
export async function logActivity(logData: LogActivityData): Promise<void> {
  try {
    // Direct logging without queue
    await prisma.logActivity.create({
      data: {
        userId: logData.userId,
        action: logData.action,
        module: logData.module,
        recordId: logData.recordId,
        oldData: logData.oldData,
        newData: logData.newData,
        description: logData.description,
        metadata: logData.metadata,
        ipAddress: logData.ipAddress,
        userAgent: logData.userAgent,
      },
    });
  } catch (error) {
    console.error('[ActivityLog] Failed to create log entry:', error);
  }
}
```

**Note:** Direct logging akan block API response. Tidak recommended untuk production.

## Recommended Setup

**For Development:**
```
Docker Redis (easiest) or WSL Redis (most Linux-like)
```

**For Production:**
```
Redis Cloud (managed) or Self-hosted Redis Cluster
```

---

✅ Setelah Redis running, activity logging system siap digunakan!
