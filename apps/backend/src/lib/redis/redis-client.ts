import Redis from 'ioredis';

let redisClient: Redis | null = null;

function createRedisClient() {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    retryStrategy: times => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
    enableReadyCheck: true,
    enableOfflineQueue: true,
    maxRetriesPerRequest: null
  });

  redisClient.on('connect', () => {
    console.log('✅ Redis client connected');
  });

  redisClient.on('error', err => {
    console.error('❌ Redis client error:', err);
  });

  redisClient.on('close', () => {
    console.log('⚠️  Redis client connection closed');
  });
}

export function getRedisClient(): Redis {
  if (!redisClient) {
    createRedisClient();
  }
  return redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('✅ Redis client closed');
  }
}
