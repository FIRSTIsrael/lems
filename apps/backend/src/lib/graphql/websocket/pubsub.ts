/**
 * PubSub system for real-time event broadcasting
 *
 * This implements a lightweight publish/subscribe system for GraphQL subscriptions.
 * Events are scoped by division to ensure proper data isolation.
 */

type Listener<T = unknown> = (payload: T) => void;

interface Subscription {
  unsubscribe: () => void;
}

class PubSub {
  private subscribers: Map<string, Set<Listener>> = new Map();

  /**
   * Publish an event to all subscribers of a specific channel
   * @param channel - The channel name (e.g., 'division:123:teamArrival')
   * @param payload - The data to send to subscribers
   */
  publish<T = unknown>(channel: string, payload: T): void {
    const listeners = this.subscribers.get(channel);
    if (!listeners) return;

    listeners.forEach(listener => {
      try {
        listener(payload);
      } catch (error) {
        console.error(`Error in PubSub listener for channel ${channel}:`, error);
      }
    });
  }

  /**
   * Subscribe to a channel
   * @param channel - The channel name to subscribe to
   * @param listener - Callback function to handle events
   * @returns Subscription object with unsubscribe method
   */
  subscribe<T = unknown>(channel: string, listener: Listener<T>): Subscription {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }

    const listeners = this.subscribers.get(channel)!;
    listeners.add(listener);

    return {
      unsubscribe: () => {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.subscribers.delete(channel);
        }
      }
    };
  }

  /**
   * Get the number of subscribers for a channel
   * @param channel - The channel name
   * @returns Number of subscribers
   */
  subscriberCount(channel: string): number {
    return this.subscribers.get(channel)?.size ?? 0;
  }

  /**
   * Clear all subscribers from a channel
   * @param channel - The channel name
   */
  clear(channel: string): void {
    this.subscribers.delete(channel);
  }

  /**
   * Clear all subscribers from all channels
   */
  clearAll(): void {
    this.subscribers.clear();
  }

  /**
   * Helper to create a division-scoped channel name
   * @param divisionId - The division ID
   * @param eventType - The event type
   * @returns Formatted channel name
   */
  divisionChannel(divisionId: string, eventType: string): string {
    return `division:${divisionId}:${eventType}`;
  }

  /**
   * Static helper to create a division-scoped channel name
   * @param divisionId - The division ID
   * @param eventType - The event type
   * @returns Formatted channel name
   */
  static divisionChannel(divisionId: string, eventType: string): string {
    return `division:${divisionId}:${eventType}`;
  }
}

// Export the class and a singleton instance
export { PubSub };
export const pubsub = new PubSub();
export default pubsub;
