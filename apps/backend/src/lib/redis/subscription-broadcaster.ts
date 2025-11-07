import { EventEmitter } from 'events';
import Redis from 'ioredis';
import { RedisEventTypes } from '@lems/types/api/lems/redis';

export interface RedisEvent {
  type: RedisEventTypes;
  divisionId: string;
  timestamp: number;
  data: Record<string, unknown>;
  version?: number;
}

/**
 * Manages a shared Redis subscriber for a specific division and event types.
 * Broadcasts all received messages to multiple listeners (clients).
 *
 * SCALING NOTE: Each broadcaster creates one Redis subscriber connection.
 * With default Redis config (10,000 max clients) and typical load:
 * - ~50-100 concurrent divisions = 50-100 connections (safe)
 * - Monitor with: redis-cli CLIENT LIST | wc -l
 * - If approaching limits, consider Redis connection pooling or clustering
 */
export class SubscriptionBroadcaster extends EventEmitter {
  private subscriber: Redis | null = null;
  private subscriptionCount = 0;
  private eventTypes: Set<RedisEventTypes>;

  constructor(
    private divisionId: string,
    eventTypes: RedisEventTypes[]
  ) {
    super();
    this.setMaxListeners(Infinity);
    this.eventTypes = new Set(eventTypes);
  }

  async connect(): Promise<void> {
    if (this.subscriber) return;

    this.subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
      enableReadyCheck: false,
      enableOfflineQueue: false,
      lazyConnect: false,
      retryStrategy: times => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    const channels = Array.from(this.eventTypes).map(et =>
      this.getChannelName(this.divisionId, et)
    );

    try {
      await this.subscriber.subscribe(...channels);
    } catch (error) {
      console.error(
        `[Redis:subscriber] Failed to subscribe for division ${this.divisionId}:`,
        error
      );
      await this.subscriber.quit().catch(() => {});
      this.subscriber = null;
      throw error;
    }

    this.subscriber.on('message', (channel, message) => {
      try {
        const event = JSON.parse(message) as RedisEvent;
        this.emit('event', event);
      } catch (error) {
        console.error(`[Redis:message] Failed to parse message on channel ${channel}:`, error);
        // Continue processing other messages
      }
    });

    this.subscriber.on('error', error => {
      console.error(
        `[Redis:subscriber] Error in subscriber for division ${this.divisionId}:`,
        error
      );
      this.emit('error', error);
    });

    this.subscriber.on('close', () => {
      console.warn(`[Redis:subscriber] Connection closed for division ${this.divisionId}`);
    });

    this.subscriber.on('reconnecting', () => {
      console.log(`[Redis:subscriber] Reconnecting for division ${this.divisionId}`);
    });
  }

  incrementSubscribers(): void {
    this.subscriptionCount++;
  }

  decrementSubscribers(): void {
    this.subscriptionCount = Math.max(0, this.subscriptionCount - 1);
  }

  hasSubscribers(): boolean {
    return this.subscriptionCount > 0;
  }

  async disconnect(): Promise<void> {
    if (this.subscriber) {
      await this.subscriber.quit();
      this.subscriber = null;
    }
    this.removeAllListeners();
  }

  private getChannelName(divisionId: string, eventType: RedisEventTypes): string {
    return `division:${divisionId}:${eventType}`;
  }
}
