import Redis from 'ioredis';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisClient } from './redis-client';
import { SubscriptionManager } from './subscription-manager';
import { RedisEvent } from './subscription-broadcaster';
export type { RedisEvent }; // Re-export for convenience

let pubSubInstance: RedisPubSub | null = null;

/**
 * Handles publishing events via Redis Pub/Sub.
 */
export class RedisPubSub {
  private publisher: Redis;
  private subscriptionManager: SubscriptionManager;

  private readonly idleTimeoutMs = 60 * 60 * 1000; // 1 hour of inactivity will close the subscription
  private readonly maxQueueSize = 100; // Maximum queued events before disconnecting slow client

  constructor() {
    this.publisher = getRedisClient();
    this.subscriptionManager = new SubscriptionManager();
  }

  /**
   * Publish an event via Pub/Sub.
   */
  async publish(
    divisionId: string,
    eventType: RedisEventTypes,
    data: Record<string, unknown>
  ): Promise<void> {
    try {
      const timestamp = Date.now();
      const event: RedisEvent = {
        type: eventType,
        divisionId,
        timestamp,
        data
      };

      const channel = this.getChannelName(divisionId, eventType);
      await this.publisher.publish(channel, JSON.stringify(event));
    } catch (error) {
      console.error(
        `[Redis:publish] Failed to publish event ${eventType} for division ${divisionId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Subscribe to division events.
   * Includes backpressure handling for slow consumers and idle timeout.
   */
  async *asyncIterator(
    divisionId: string,
    eventType: RedisEventTypes
  ): AsyncGenerator<RedisEvent, void, unknown> {
    const broadcaster = await this.subscriptionManager.getBroadcaster(divisionId, eventType);
    broadcaster.incrementSubscribers();

    const messageQueue: RedisEvent[] = [];
    let resolveWait: (() => void) | null = null;
    let timeoutHandle: NodeJS.Timeout | null = null;
    let isActive = true;

    const messageHandler = (event: RedisEvent) => {
      if (!isActive) return;

      // Backpressure: disconnect slow clients to protect server memory
      if (messageQueue.length >= this.maxQueueSize) {
        console.warn(
          `[Redis:backpressure] Client exceeded ${this.maxQueueSize} queued events for division ${divisionId}, disconnecting`
        );
        isActive = false;
        broadcaster.removeListener('event', messageHandler);

        // Wake up the consumer so they can exit the loop
        if (resolveWait) {
          if (timeoutHandle) clearTimeout(timeoutHandle);
          timeoutHandle = null;
          resolveWait();
          resolveWait = null;
        }

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
            }, this.idleTimeoutMs);
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

  async shutdown(): Promise<void> {
    await this.subscriptionManager.shutdown();
  }

  /**
   * Get the Redis channel name for a division and event type
   */
  private getChannelName(divisionId: string, eventType: RedisEventTypes): string {
    return `division:${divisionId}:${eventType}`;
  }
}

export const getRedisPubSub = (): RedisPubSub => {
  if (!pubSubInstance) {
    pubSubInstance = new RedisPubSub();
  }
  return pubSubInstance;
};

export const shutdownRedisPubSub = async (): Promise<void> => {
  if (pubSubInstance) {
    await pubSubInstance.shutdown();
    pubSubInstance = null;
  }
};
