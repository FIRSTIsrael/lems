import Redis from 'ioredis';
import { logger } from '../logger';

const isProduction = process.env.NODE_ENV === 'production';

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
    tls: isProduction ? {} : undefined,
    enableReadyCheck: true,
    enableOfflineQueue: true,
    maxRetriesPerRequest: null,
    lazyConnect: true
  });

  redisClient.on('connect', () => {
    logger.info({ component: 'redis' }, 'Redis client connected');
  });

  redisClient.on('error', err => {
    logger.error({ component: 'redis', error: err.message }, 'Redis client error');
  });

  redisClient.on('close', () => {
    logger.warn({ component: 'redis' }, 'Redis client connection closed');
  });

  redisClient.on('reconnecting', () => {
    logger.info({ component: 'redis' }, 'Redis client reconnecting');
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
    logger.info({ component: 'redis' }, 'Redis client closed');
  }
};
