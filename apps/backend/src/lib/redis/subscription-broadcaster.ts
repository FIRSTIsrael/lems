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
      enableOfflineQueue: false
    });

    const channels = Array.from(this.eventTypes).map(et =>
      this.getChannelName(this.divisionId, et)
    );

    await this.subscriber.subscribe(...channels);

    this.subscriber.on('message', (channel, message) => {
      try {
        const event = JSON.parse(message) as RedisEvent;
        this.emit('event', event);
      } catch (error) {
        console.error(`[Redis:message] Failed to parse message on channel ${channel}:`, error);
      }
    });

    this.subscriber.on('error', error => {
      console.error(
        `[Redis:subscriber] Error in subscriber for division ${this.divisionId}:`,
        error
      );
      this.emit('error', error);
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
