import Redis from 'ioredis';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisClient } from './redis-client';

export interface RedisEvent {
  type: RedisEventTypes;
  divisionId: string;
  timestamp: number;
  data: Record<string, unknown>;
  version?: number;
}

export class RedisStreamsPubSub {
  private publisher: Redis;
  private eventVersionMap: Map<RedisEventTypes, number> = new Map();
  private readonly messageRetentionMs = 30 * 1000; // 30 seconds

  constructor() {
    this.publisher = getRedisClient();
  }

  /**
   * Get channel name for a specific event type in a division
   */
  private getChannelName(divisionId: string, eventType: RedisEventTypes): string {
    return `division:${divisionId}:${eventType}`;
  }

  /**
   * Publish an event via Pub/Sub and buffer for recovery
   */
  async publish(
    divisionId: string,
    eventType: RedisEventTypes,
    data: Record<string, unknown>
  ): Promise<void> {
    const currentVersion = (this.eventVersionMap.get(eventType) || 0) + 1;
    this.eventVersionMap.set(eventType, currentVersion);

    const event: RedisEvent = {
      type: eventType,
      divisionId,
      timestamp: Date.now(),
      data,
      version: currentVersion
    };

    // Publish to event-type-specific channel
    const channel = this.getChannelName(divisionId, eventType);
    await this.publisher.publish(channel, JSON.stringify(event));
    await this.bufferEvent(divisionId, eventType, event);
  }

  /**
   * Buffer event in Redis sorted set for recovery
   */
  private async bufferEvent(
    divisionId: string,
    eventType: RedisEventTypes,
    event: RedisEvent
  ): Promise<void> {
    const bufferKey = `buffer:${divisionId}:${eventType}`;
    const timestamp = Date.now();

    await this.publisher.zadd(bufferKey, timestamp, JSON.stringify(event));
    await this.publisher.zremrangebyscore(bufferKey, '-inf', timestamp - this.messageRetentionMs);
    await this.publisher.expire(bufferKey, 35);
  }

  /**
   * Recover missed events from buffer for a specific event type
   */
  private async recoverMissedEvents(
    divisionId: string,
    eventType: RedisEventTypes,
    clientLastVersion: number
  ): Promise<RedisEvent[]> {
    const bufferKey = `buffer:${divisionId}:${eventType}`;
    const bufferedData = await this.publisher.zrange(bufferKey, 0, -1);
    const events: RedisEvent[] = [];

    for (const data of bufferedData) {
      const event = JSON.parse(data) as RedisEvent;
      if ((event.version || 0) > clientLastVersion) {
        events.push(event);
      }
    }

    // Check if gap is too large
    const serverVersion = this.eventVersionMap.get(eventType) || 0;
    if (serverVersion - clientLastVersion > 1000) {
      events.push({
        type: eventType,
        divisionId,
        timestamp: Date.now(),
        data: { _gap: true },
        version: serverVersion
      });
    }

    return events;
  }

  /**
   * Subscribe to division events with optional recovery
   * Each event type gets its own channel
   */
  async *asyncIterator(
    divisionId: string,
    eventTypes: RedisEventTypes[],
    clientLastVersions?: Map<RedisEventTypes, number>
  ): AsyncGenerator<RedisEvent, void, unknown> {
    const subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10)
    });

    try {
      // Phase 1: Recover missed events for each event type
      if (clientLastVersions) {
        for (const eventType of eventTypes) {
          const clientLastVersion = clientLastVersions.get(eventType) || 0;
          const recovered = await this.recoverMissedEvents(
            divisionId,
            eventType,
            clientLastVersion
          );

          for (const event of recovered) {
            yield event;
          }
        }
      }

      // Phase 2: Subscribe to event-type-specific channels
      const channels = eventTypes.map(et => this.getChannelName(divisionId, et));
      await subscriber.subscribe(...channels);

      // Create a promise that resolves when a message arrives on any channel
      const messageHandler = new Promise<RedisEvent | null>(resolve => {
        subscriber.on('message', (_, message) => {
          try {
            const event = JSON.parse(message) as RedisEvent;
            resolve(event);
          } catch {
            resolve(null);
          }
        });
      });

      while (true) {
        const event = await messageHandler;
        if (event) {
          yield event;
        }
      }
    } finally {
      await subscriber.quit();
    }
  }
}

// Singleton instance
let pubSubInstance: RedisStreamsPubSub | null = null;

export function getRedisStreamsPubSub(): RedisStreamsPubSub {
  if (!pubSubInstance) {
    pubSubInstance = new RedisStreamsPubSub();
  }
  return pubSubInstance;
}
