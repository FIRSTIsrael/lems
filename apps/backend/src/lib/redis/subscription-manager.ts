import { createHash } from 'crypto';
import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { SubscriptionBroadcaster } from './subscription-broadcaster';

/**
 * Manages shared Redis subscribers across multiple divisions.
 * Ensures multiple clients subscribing to the same division reuse the same connection.
 * Handles automatic cleanup of unused broadcasters.
 */
export class SubscriptionManager {
  private broadcasters: Map<string, SubscriptionBroadcaster> = new Map();
  private pendingConnections: Map<string, Promise<SubscriptionBroadcaster>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Periodically clean up unused broadcasters
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup().catch(error => {
          console.error('[Redis:cleanup] Cleanup interval failed:', error);
        });
      },
      60 * 1000 * 60
    ); // 60 minutes
    this.cleanupInterval.unref();
  }

  /**
   * Get or create a broadcaster for the given division and event types.
   */
  async getBroadcaster(
    divisionId: string,
    eventTypes: RedisEventTypes[]
  ): Promise<SubscriptionBroadcaster> {
    const key = this.getKey(divisionId, eventTypes);

    // Return existing broadcaster if available
    const existing = this.broadcasters.get(key);
    if (existing) {
      return existing;
    }

    // Return pending connection if one is in progress
    const pending = this.pendingConnections.get(key);
    if (pending) {
      return pending;
    }

    // Create new broadcaster with connection promise
    const connectionPromise = (async () => {
      const broadcaster = new SubscriptionBroadcaster(divisionId, eventTypes);
      try {
        await broadcaster.connect();
        this.broadcasters.set(key, broadcaster);
        return broadcaster;
      } catch (error) {
        // Clean up failed broadcaster
        await broadcaster.disconnect().catch(() => {});
        throw error;
      } finally {
        // Always remove pending promise to allow retry
        this.pendingConnections.delete(key);
      }
    })();

    this.pendingConnections.set(key, connectionPromise);
    return connectionPromise;
  }

  /**
   * Clean up broadcasters with no active subscribers
   */
  private async cleanup(): Promise<void> {
    const keysToDelete: string[] = [];

    for (const [key, broadcaster] of this.broadcasters.entries()) {
      if (!broadcaster.hasSubscribers()) {
        try {
          await broadcaster.disconnect();
          keysToDelete.push(key);
        } catch (error) {
          console.error(`[Redis:cleanup] Failed to disconnect broadcaster ${key}:`, error);
        }
      }
    }

    keysToDelete.forEach(key => this.broadcasters.delete(key));

    if (keysToDelete.length > 0) {
      console.debug(`[Redis:cleanup] Cleaned up ${keysToDelete.length} unused broadcaster(s)`);
    }
  }

  /**
   * Shutdown all broadcasters and cleanup resources
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
    this.pendingConnections.clear();
  }

  /**
   * Generate a unique key for a division+eventTypes combination
   */
  private getKey(divisionId: string, eventTypes: RedisEventTypes[]): string {
    const key = Array.from(eventTypes).sort().join(',');
    const hashSize = 16;
    const hash = createHash('sha256').update(key).digest('hex').slice(0, hashSize);
    return `${divisionId}:${hash}`;
  }
}
