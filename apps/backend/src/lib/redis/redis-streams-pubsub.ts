import Redis from 'ioredis';
import { getRedisClient } from './redis-client';

/**
 * Redis Streams-based Pub/Sub implementation
 * Provides at-least-once delivery semantics with persistence
 * Supports multi-instance deployments via consumer groups
 */
export class RedisStreamsPubSub {
  private publisher: Redis;
  private consumerGroup: string;
  private consumerName: string;
  private instanceId: string;

  constructor() {
    this.publisher = getRedisClient();
    this.consumerGroup = process.env.REDIS_CONSUMER_GROUP || 'lems-graphql';
    this.instanceId = process.env.INSTANCE_ID || `instance-${process.pid}`;
    this.consumerName = `${this.consumerGroup}-${this.instanceId}`;
  }

  /**
   * Publish a message to a stream channel
   * Messages are persisted in Redis and can be consumed by all subscribers
   *
   * @param channel - The stream key (prefixed with 'stream:')
   * @param payload - The data to publish
   * @returns The stream message ID
   */
  async publish(channel: string, payload: Record<string, unknown>): Promise<string> {
    const streamKey = this.getStreamKey(channel);

    try {
      const messageId = await this.publisher.xadd(
        streamKey,
        'MAXLEN',
        '~',
        '10000', // Keep ~10k messages per stream
        '*', // Auto-generate message ID
        'data',
        JSON.stringify({
          payload,
          timestamp: Date.now(),
          instanceId: this.instanceId
        })
      );

      return messageId;
    } catch (error) {
      console.error(`Error publishing to stream ${streamKey}:`, error);
      throw error;
    }
  }

  /**
   * Initialize a consumer group for a stream
   * Must be called before consuming messages
   *
   * @param channel - The stream channel
   */
  async initializeConsumerGroup(channel: string): Promise<void> {
    const streamKey = this.getStreamKey(channel);

    try {
      await this.publisher.xgroup(
        'CREATE',
        streamKey,
        this.consumerGroup,
        '0', // Start from the beginning
        'MKSTREAM' // Create stream if it doesn't exist
      );
      console.log(`✅ Consumer group initialized: ${this.consumerGroup} for stream ${streamKey}`);
    } catch (error: unknown) {
      // Consumer group might already exist
      const errorMessage = (error as Error)?.message || '';
      if (errorMessage?.includes('BUSYGROUP')) {
        console.log(`⚠️  Consumer group already exists: ${this.consumerGroup}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Get the fully qualified stream key
   *
   * @param channel - The channel name
   * @returns The stream key with 'stream:' prefix
   */
  private getStreamKey(channel: string): string {
    return `stream:${channel}`;
  }

  /**
   * Get instance ID for identification across instances
   */
  getInstanceId(): string {
    return this.instanceId;
  }

  /**
   * Get consumer group name
   */
  getConsumerGroup(): string {
    return this.consumerGroup;
  }
}

// Singleton instance
let pubSubInstance: RedisStreamsPubSub | null = null;

/**
 * Get or create the Redis Streams Pub/Sub instance
 *
 * @returns RedisStreamsPubSub instance
 */
export function getRedisStreamsPubSub(): RedisStreamsPubSub {
  if (!pubSubInstance) {
    pubSubInstance = new RedisStreamsPubSub();
  }
  return pubSubInstance;
}
