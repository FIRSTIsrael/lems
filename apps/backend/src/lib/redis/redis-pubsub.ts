import Redis from 'ioredis';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisClient } from './redis-client';
import { SubscriptionManager } from './subscription-manager';
import { RedisEvent } from './subscription-broadcaster';
export { RedisEvent } from './subscription-broadcaster';

let pubSubInstance: RedisPubSub | null = null;

/**
 * Handles publishing events via Redis Pub/Sub with message buffering and recovery.
 * Maintains per-division version tracking to detect and recover missed events.
 */
export class RedisPubSub {
  private publisher: Redis;
  private eventVersionMap: Map<string, number> = new Map();
  private versionMapLastCleanup = Date.now();
  private subscriptionManager: SubscriptionManager;
  private readonly messageRetentionMs = 30 * 1000; // 30 seconds
  private readonly maxRecoverySize = 1000;
  private readonly versionMapCleanupInterval = 3600 * 1000; // 1 hour

  constructor() {
    this.publisher = getRedisClient();
    this.subscriptionManager = new SubscriptionManager();
  }

  /**
   * Publish an event via Pub/Sub and buffer it for recovery
   */
  async publish(
    divisionId: string,
    eventType: RedisEventTypes,
    data: Record<string, unknown>
  ): Promise<void> {
    const versionKey = this.getVersionKey(divisionId, eventType);
    const currentVersion = (this.eventVersionMap.get(versionKey) || 0) + 1;
    this.eventVersionMap.set(versionKey, currentVersion);

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

    this.cleanupVersionMapIfNeeded();
  }

  /**
   * Subscribe to division events with optional message recovery
   */
  async *asyncIterator(
    divisionId: string,
    eventTypes: RedisEventTypes[],
    clientLastVersions?: Map<RedisEventTypes, number>
  ): AsyncGenerator<RedisEvent, void, unknown> {
    const broadcaster = await this.subscriptionManager.getBroadcaster(divisionId, eventTypes);
    broadcaster.incrementSubscribers();

    const messageQueue: RedisEvent[] = [];
    const maxQueueSize = 1000;
    let resolveWait: (() => void) | null = null;
    let isActive = true;

    const messageHandler = (event: RedisEvent) => {
      if (!isActive) return;
      if (messageQueue.length >= maxQueueSize) {
        messageQueue.shift();
      }
      messageQueue.push(event);
      if (resolveWait) {
        resolveWait();
        resolveWait = null;
      }
    };

    try {
      // Phase 1: Recover missed events
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

      // Phase 2: Listen for new events
      broadcaster.on('event', messageHandler);

      while (isActive) {
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
      isActive = false;
      broadcaster.removeListener('event', messageHandler);
      if (resolveWait) {
        resolveWait();
        resolveWait = null;
      }
      broadcaster.decrementSubscribers();
    }
  }

  /**
   * Shutdown the subscription manager
   */
  async shutdown(): Promise<void> {
    await this.subscriptionManager.shutdown();
  }

  /**
   * Get the Redis channel name for a division and event type
   */
  private getChannelName(divisionId: string, eventType: RedisEventTypes): string {
    return `division:${divisionId}:${eventType}`;
  }

  /**
   * Get the version map key for a division and event type
   */
  private getVersionKey(divisionId: string, eventType: RedisEventTypes): string {
    return `${divisionId}:${eventType}`;
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

    const versionKey = this.getVersionKey(divisionId, eventType);
    const serverVersion = this.eventVersionMap.get(versionKey) || 0;

    if (serverVersion - clientLastVersion > this.maxRecoverySize) {
      events.push({
        type: eventType,
        divisionId,
        timestamp: Date.now(),
        data: { _gap: true },
        version: serverVersion
      });
    }

    for (const data of bufferedData) {
      const event = JSON.parse(data) as RedisEvent;
      if ((event.version || 0) > clientLastVersion) {
        events.push(event);
      }
    }

    return events;
  }

  /**
   * Periodically clean up version map entries for inactive divisions
   */
  private cleanupVersionMapIfNeeded(): void {
    const now = Date.now();
    if (now - this.versionMapLastCleanup < this.versionMapCleanupInterval) {
      return;
    }

    this.versionMapLastCleanup = now;
    const activeDivisions = this.subscriptionManager.getActiveDivisions();

    const keysToDelete: string[] = [];
    for (const versionKey of this.eventVersionMap.keys()) {
      const divisionId = versionKey.split(':')[0];
      if (!activeDivisions.has(divisionId)) {
        keysToDelete.push(versionKey);
      }
    }

    keysToDelete.forEach(key => this.eventVersionMap.delete(key));

    if (keysToDelete.length > 0) {
      console.debug(`[Redis:cleanup] Cleaned up ${keysToDelete.length} version map entries`);
    }
  }
}

/**
 * Get or create the singleton RedisPubSub instance
 */
export function getRedisPubSub(): RedisPubSub {
  if (!pubSubInstance) {
    pubSubInstance = new RedisPubSub();
  }
  return pubSubInstance;
}
