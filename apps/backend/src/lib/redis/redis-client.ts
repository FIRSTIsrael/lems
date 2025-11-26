import Redis from 'ioredis';

let redisClient: Redis | null = null;

const createRedisClient = (): Redis => {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    retryStrategy: times => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    enableReadyCheck: true,
    enableOfflineQueue: true,
    maxRetriesPerRequest: null,
    lazyConnect: false
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis client connected');
  });

  redisClient.on('error', err => {
    console.error('❌ Redis client error:', err);
  });

  redisClient.on('close', () => {
    console.warn('⚠️  Redis client connection closed');
  });

  redisClient.on('reconnecting', () => {
    console.log('🔄 Redis client reconnecting...');
  });

  return redisClient;
};

export const getRedisClient = (): Redis => {
  if (!redisClient || redisClient.status === 'end') {
    return createRedisClient();
  }
  return redisClient;
};

export const closeRedisClient = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('✅ Redis client closed');
  }
};
