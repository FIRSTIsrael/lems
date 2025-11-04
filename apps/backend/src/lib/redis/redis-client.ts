import Redis from 'ioredis';

/**
 * Singleton Redis client instance, for commands
 */
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
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

  return redisClient;
}

/**
 * Create a separate subscriber instance for subscriptions/listening
 * Required by redis for pub/sub operations (cannot be shared with command client)
 *
 * @returns Redis subscriber instance
 */
export function createRedisSubscriber(): Redis {
  const subscriber = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    retryStrategy: times => {
      const delay = Math.min(times * 50, 2000);
      return delay;
    }
  });

  subscriber.on('connect', () => {
    console.log('✅ Redis subscriber connected');
  });

  subscriber.on('error', err => {
    console.error('❌ Redis subscriber error:', err);
  });

  return subscriber;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('✅ Redis client closed');
  }
}
