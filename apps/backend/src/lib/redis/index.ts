/**
 * Redis module - Core Redis connectivity and pub/sub infrastructure
 * Provides:
 * - Redis client connection management
 * - Redis Streams-based pub/sub for multi-instance support
 */

export { getRedisClient, createRedisSubscriber, closeRedisClient } from './redis-client';

export { RedisStreamsPubSub, getRedisStreamsPubSub } from './redis-streams-pubsub';

export { initializeRedis, cleanupRedis } from './initialization';
