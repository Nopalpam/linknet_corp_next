import Redis from 'ioredis';

/**
 * Redis client configuration
 */
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};

/**
 * Redis client instance
 */
export const redisClient = new Redis(redisConfig);

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('error', (error) => {
  console.error('❌ Redis connection error:', error);
});

redisClient.on('close', () => {
  console.log('⚠️  Redis connection closed');
});

/**
 * Check if Redis is available
 */
export const isRedisAvailable = async (): Promise<boolean> => {
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
  await redisClient.quit();
};

export default redisClient;
