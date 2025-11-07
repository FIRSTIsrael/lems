import { EventEmitter } from 'events';
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

/**
 * Manages a shared Redis subscriber for a specific division and set of event types.
 * Multiple clients can subscribe through this broadcaster without creating redundant connections.
 */
class SubscriptionBroadcaster extends EventEmitter {
  private subscriber: Redis | null = null;
  private subscriptionCount = 0;
  private eventTypes: Set<RedisEventTypes>;

  constructor(
    private divisionId: string,
    eventTypes: RedisEventTypes[]
  ) {
    super();
    this.eventTypes = new Set(eventTypes);
  }

  /**
   * Connect the broadcaster's subscriber to Redis if not already connected
   */
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
        // Broadcast to all attached consumers
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

  /**
   * Increment subscription count
   */
  incrementSubscribers(): void {
    this.subscriptionCount++;
  }

  /**
   * Decrement subscription count
   */
  decrementSubscribers(): void {
    this.subscriptionCount = Math.max(0, this.subscriptionCount - 1);
  }

  /**
   * Check if broadcaster has active subscribers
   */
  hasSubscribers(): boolean {
    return this.subscriptionCount > 0;
  }

  /**
   * Disconnect the subscriber and cleanup
   */
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

/**
 * Manages shared subscribers per division to avoid creating redundant connections.
 * Multiple clients subscribing to the same division/eventTypes will reuse the same subscriber.
 */
class SubscriptionManager {
  private broadcasters: Map<string, SubscriptionBroadcaster> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodically clean up unused broadcasters
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000); // 60 seconds
  }

  /**
   * Get or create a broadcaster for the given division and event types
   */
  async getBroadcaster(
    divisionId: string,
    eventTypes: RedisEventTypes[]
  ): Promise<SubscriptionBroadcaster> {
    const key = this.getKey(divisionId, eventTypes);

    if (!this.broadcasters.has(key)) {
      const broadcaster = new SubscriptionBroadcaster(divisionId, eventTypes);
      await broadcaster.connect();
      this.broadcasters.set(key, broadcaster);
    }

    return this.broadcasters.get(key)!;
  }

  /**
   * Clean up broadcasters with no active subscribers
   */
  private async cleanup(): Promise<void> {
    const keysToDelete: string[] = [];

    for (const [key, broadcaster] of this.broadcasters.entries()) {
      if (!broadcaster.hasSubscribers()) {
        await broadcaster.disconnect();
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.broadcasters.delete(key));

    if (keysToDelete.length > 0) {
      console.debug(`[Redis:cleanup] Cleaned up ${keysToDelete.length} unused broadcaster(s)`);
    }
  }

  /**
   * Shutdown all broadcasters
   */
  async shutdown(): Promise<void> {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    for (const broadcaster of this.broadcasters.values()) {
      await broadcaster.disconnect();
    }
    this.broadcasters.clear();
  }

  private getKey(divisionId: string, eventTypes: RedisEventTypes[]): string {
    return `${divisionId}:${Array.from(eventTypes).sort().join(',')}`;
  }
}

class RedisPubSub {
  private publisher: Redis;
  private eventVersionMap: Map<RedisEventTypes, number> = new Map();
  private subscriptionManager: SubscriptionManager;
  private readonly messageRetentionMs = 30 * 1000; // 30 seconds
  private readonly maxRecoverySize = 1000; // Max events to recover

  constructor() {
    this.publisher = getRedisClient();
    this.subscriptionManager = new SubscriptionManager();
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
   * Recover missed events from buffer for a specific event type.
   * Returns all events that were missed since the provided last version
   */
  private async recoverMissedEvents(
    divisionId: string,
    eventType: RedisEventTypes,
    clientLastVersion: number
  ): Promise<RedisEvent[]> {
    const bufferKey = `buffer:${divisionId}:${eventType}`;
    const bufferedData = await this.publisher.zrange(bufferKey, 0, -1); // All events
    const events: RedisEvent[] = [];

    /* Check for large gaps in versions, tell the client to refetch
       if the gap is more than maxRecoverySize */
    const serverVersion = this.eventVersionMap.get(eventType) || 0;
    if (serverVersion - clientLastVersion > this.maxRecoverySize) {
      events.push({
        type: eventType,
        divisionId,
        timestamp: Date.now(),
        data: { _gap: true },
        version: serverVersion
      });
    }

    /* Iterate through all buffered events, push only events
       that are newer than clientLastVersion */
    for (const data of bufferedData) {
      const event = JSON.parse(data) as RedisEvent;
      if ((event.version || 0) > clientLastVersion) {
        events.push(event);
      }
    }

    return events;
  }

  /**
   * Subscribe to division events with optional recovery.
   * Uses a shared broadcaster per division to avoid redundant Redis connections.
   * Multiple clients subscribing simultaneously will reuse the same broadcaster.
   */
  async *asyncIterator(
    divisionId: string,
    eventTypes: RedisEventTypes[],
    clientLastVersions?: Map<RedisEventTypes, number>
  ): AsyncGenerator<RedisEvent, void, unknown> {
    // Get or create a shared broadcaster for this division+eventTypes
    const broadcaster = await this.subscriptionManager.getBroadcaster(divisionId, eventTypes);
    broadcaster.incrementSubscribers();

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

      // Phase 2: Listen for events from the shared broadcaster
      const messageQueue: (RedisEvent | null)[] = [];
      let resolveWait: (() => void) | null = null;

      const messageHandler = (event: RedisEvent) => {
        messageQueue.push(event);
        if (resolveWait) {
          resolveWait();
          resolveWait = null;
        }
      };

      broadcaster.on('event', messageHandler);

      try {
        while (true) {
          // If queue is empty, wait for a message
          if (messageQueue.length === 0) {
            await new Promise<void>(resolve => {
              resolveWait = resolve;
            });
          }

          const event = messageQueue.shift();
          if (event) {
            yield event;
          }
        }
      } finally {
        broadcaster.removeListener('event', messageHandler);
      }
    } finally {
      broadcaster.decrementSubscribers();
    }
  }

  /**
   * Shutdown the subscription manager (cleanup resources)
   */
  async shutdown(): Promise<void> {
    await this.subscriptionManager.shutdown();
  }
}

let pubSubInstance: RedisPubSub | null = null;

export function getRedisPubSub(): RedisPubSub {
  if (!pubSubInstance) {
    pubSubInstance = new RedisPubSub();
  }
  return pubSubInstance;
}
