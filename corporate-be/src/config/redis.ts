import Redis from 'ioredis';

/**
 * Check if Redis is enabled from environment
 */
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

/**
 * Redis client configuration
 */
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => {
    // Disable retry if Redis is not enabled
    if (!REDIS_ENABLED) return null;
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: REDIS_ENABLED ? 3 : 0,
  lazyConnect: true, // Don't connect immediately
  enableOfflineQueue: REDIS_ENABLED,
};

/**
 * Redis client instance (lazy initialized)
 */
export const redisClient = new Redis(redisConfig);

// Only setup event listeners if Redis is enabled
if (REDIS_ENABLED) {
  redisClient.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redisClient.on('error', (error) => {
    console.error('❌ Redis connection error:', error.message);
  });

  redisClient.on('close', () => {
    console.log('⚠️  Redis connection closed');
  });

  // Connect to Redis when enabled
  redisClient.connect().catch((error) => {
    console.error('Failed to connect to Redis:', error.message);
  });
} else {
  console.log('⚠️  Redis is DISABLED (set REDIS_ENABLED=true to enable)');
}

/**
 * Check if Redis is available
 */
export const isRedisAvailable = async (): Promise<boolean> => {
  if (!REDIS_ENABLED) return false;
  
  try {
    await redisClient.ping();
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Gracefully close Redis connection
 */
export const closeRedis = async (): Promise<void> => {
  if (REDIS_ENABLED) {
    await redisClient.quit();
  }
};

export default redisClient;
