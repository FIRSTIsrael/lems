import { getRedisClient } from './redis-client';

/**
 * Initialize Redis connection on application startup
 * Verifies connection and readiness
 *
 * @throws Error if Redis connection fails
 */
export async function initializeRedis(): Promise<void> {
  try {
    const redis = getRedisClient();

    // Test the connection
    await redis.ping();
    console.log('✅ Redis initialized and connection verified');
  } catch (error) {
    console.error('❌ Failed to initialize Redis:', error);
    throw new Error('Redis initialization failed');
  }
}

/**
 * Cleanup Redis connection on application shutdown
 * Should be called during graceful shutdown
 */
export async function cleanupRedis(): Promise<void> {
  const { closeRedisClient } = await import('./redis-client');
  await closeRedisClient();
}
