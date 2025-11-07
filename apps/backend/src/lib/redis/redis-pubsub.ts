import Redis from 'ioredis';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisClient } from './redis-client';
import { SubscriptionManager } from './subscription-manager';
import { RedisEvent } from './subscription-broadcaster';
export { RedisEvent } from './subscription-broadcaster';

let pubSubInstance: RedisPubSub | null = null;

/**
 * Handles publishing events via Redis Pub/Sub with message buffering and recovery.
 */
export class RedisPubSub {
  private publisher: Redis;
  private subscriptionManager: SubscriptionManager;
  private readonly messageRetentionMs = 30 * 1000; // 30 seconds
  private readonly maxRecoverySize = 1000;

  constructor() {
    this.publisher = getRedisClient();
    this.subscriptionManager = new SubscriptionManager();
  }

  /**
   * Publish an event via Pub/Sub and buffer it for recovery.
   */
  async publish(
    divisionId: string,
    eventType: RedisEventTypes,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      const versionKey = this.getVersionKey(divisionId, eventType);
      const version = await this.publisher.incr(versionKey);

      // Set TTL on version key (35 seconds) to prevent unbounded growth
      // Versions are only recoverable for 30 seconds, so a short TTL is sufficient
      await this.publisher.expire(versionKey, 35);

      const event: RedisEvent = {
        type: eventType,
        divisionId,
        timestamp: Date.now(),
        data,
        version
      };

      const channel = this.getChannelName(divisionId, eventType);

      const pipeline = this.publisher.pipeline();
      pipeline.publish(channel, JSON.stringify(event));

      // Buffer event for recovery
      const bufferKey = `buffer:${divisionId}:${eventType}`;
      const timestamp = Date.now();
      pipeline.zadd(bufferKey, timestamp, JSON.stringify(event));
      pipeline.zremrangebyscore(bufferKey, '-inf', timestamp - this.messageRetentionMs);

      // Set TTL on buffer (35 seconds) to prevent unbounded growth
      // Versions are only recoverable for 30 seconds, so a short TTL is sufficient
      pipeline.expire(bufferKey, 35); // Expires if no events published for 2 minutes

      const results = await pipeline.exec();

      // Check each command for errors to prevent version drift
      if (results) {
        for (const [error] of results) {
          if (error) {
            throw new Error(`Pipeline command failed: ${error.message}`);
          }
        }
      }
    } catch (error) {
      console.error(
        `[Redis:publish] Failed to publish event ${eventType} for division ${divisionId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Subscribe to division events with optional message recovery.
   * Includes backpressure handling for slow consumers.
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
    const idleTimeoutMs = 60 * 60 * 1000; // 1 hour of inactivity will close the subscription
    let resolveWait: (() => void) | null = null;
    let timeoutHandle: NodeJS.Timeout | null = null;
    let isActive = true;

    const messageHandler = (event: RedisEvent) => {
      if (!isActive) return;

      // Disconnect slow consumers, they should refetch initial data
      if (messageQueue.length >= maxQueueSize) {
        console.warn(
          `[Redis:backpressure] Client exceeded queue limit for division ${divisionId}, disconnecting`
        );
        isActive = false;
        broadcaster.removeListener('event', messageHandler);
        return;
      }

      messageQueue.push(event);
      if (resolveWait) {
        if (timeoutHandle) clearTimeout(timeoutHandle);
        timeoutHandle = null;
        resolveWait();
        resolveWait = null;
      }
    };

    try {
      broadcaster.on('event', messageHandler);

      // Recover missed events (new events queue up in parallel)
      const lastSeenVersions = new Map<RedisEventTypes, number>();
      if (clientLastVersions) {
        for (const eventType of eventTypes) {
          const clientLastVersion = clientLastVersions.get(eventType) || 0;
          const recovered = await this.recoverMissedEvents(
            divisionId,
            eventType,
            clientLastVersion
          );
          for (const event of recovered) {
            if (event.version) lastSeenVersions.set(event.type, event.version);
            yield event;
          }
        }
      }

      // Deduplicate: skip queued events with versions <= last recovered
      const dedupedQueue: RedisEvent[] = [];
      for (const event of messageQueue) {
        const lastSeen = lastSeenVersions.get(event.type) || 0;
        if (!event.version || event.version > lastSeen) {
          dedupedQueue.push(event);
        }
      }
      messageQueue.length = 0;
      messageQueue.push(...dedupedQueue);

      // Stream events
      while (isActive) {
        if (messageQueue.length === 0) {
          let timedOut = false;
          await new Promise<void>(resolve => {
            resolveWait = resolve;
            timeoutHandle = setTimeout(() => {
              if (resolveWait) {
                timedOut = true;
                resolveWait();
                resolveWait = null;
              }
            }, idleTimeoutMs);
          });

          // Exit after idle timeout to free resources
          if (timedOut && messageQueue.length === 0) {
            isActive = false;
            break;
          }
        }
        const event = messageQueue.shift();
        if (event) yield event;
      }
    } finally {
      isActive = false;
      if (timeoutHandle) clearTimeout(timeoutHandle);
      broadcaster.removeListener('event', messageHandler);
      if (resolveWait) resolveWait();
      broadcaster.decrementSubscribers();
    }
  }

  /**
   * Shutdown the pub/sub system and cleanup resources
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
   * Recover missed events from buffer for a specific event type.
   * Uses Redis to check current version.
   */
  private async recoverMissedEvents(
    divisionId: string,
    eventType: RedisEventTypes,
    clientLastVersion: number
  ): Promise<RedisEvent[]> {
    const bufferKey = `buffer:${divisionId}:${eventType}`;
    const versionKey = this.getVersionKey(divisionId, eventType);

    // Get current server version from Redis
    const serverVersionStr = await this.publisher.get(versionKey);
    const serverVersion = serverVersionStr ? parseInt(serverVersionStr, 10) : 0;

    // If gap is too large, send gap marker, signal client to refetch
    if (serverVersion - clientLastVersion > this.maxRecoverySize) {
      return [
        {
          type: eventType,
          divisionId,
          timestamp: Date.now(),
          data: { _gap: true },
          version: serverVersion
        }
      ];
    }

    // Retrieve buffered events
    const bufferedData = await this.publisher.zrange(bufferKey, 0, -1);
    const events: RedisEvent[] = [];

    for (const data of bufferedData) {
      try {
        const event = JSON.parse(data) as RedisEvent;
        if ((event.version || 0) > clientLastVersion) {
          events.push(event);
        }
      } catch (error) {
        console.error(`[Redis:recovery] Failed to parse buffered event:`, error);
        // Skip corrupted event and continue
      }
    }

    return events;
  }
}

export function getRedisPubSub(): RedisPubSub {
  if (!pubSubInstance) {
    pubSubInstance = new RedisPubSub();
  }
  return pubSubInstance;
}

export async function shutdownRedisPubSub(): Promise<void> {
  if (pubSubInstance) {
    await pubSubInstance.shutdown();
    pubSubInstance = null;
  }
}
