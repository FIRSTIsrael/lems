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
    this.cleanupInterval = setInterval(() => this.cleanup(), 60_000); // 60 seconds
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
    if (this.broadcasters.has(key)) {
      return this.broadcasters.get(key)!;
    }

    // Return pending connection if one is in progress
    if (this.pendingConnections.has(key)) {
      return this.pendingConnections.get(key)!;
    }

    // Create new broadcaster with connection promise
    const connectionPromise = (async () => {
      const broadcaster = new SubscriptionBroadcaster(divisionId, eventTypes);
      await broadcaster.connect();
      this.broadcasters.set(key, broadcaster);
      this.pendingConnections.delete(key);
      return broadcaster;
    })();

    this.pendingConnections.set(key, connectionPromise);
    return connectionPromise;
  }

  /**
   * Get a Set of active division IDs with ongoing subscriptions
   */
  getActiveDivisions(): Set<string> {
    const activeDivisions = new Set<string>();
    for (const key of this.broadcasters.keys()) {
      const divisionId = key.split(':')[0];
      activeDivisions.add(divisionId);
    }
    return activeDivisions;
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
