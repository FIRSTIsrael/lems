import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../redis/redis-pubsub';

/**
 * Base arguments for all subscriptions that support message recovery.
 * Every subscription should extend this interface for consistency.
 */
export interface BaseSubscriptionArgs {
  /**
   * The last seen version for this subscription event type.
   * Used for message recovery: if client reconnects within 30 seconds,
   * server automatically sends any buffered messages since this version.
   */
  lastSeenVersion?: number;
}

/**
 * Represents a recovery gap marker when subscription buffer is exceeded.
 * Client should refetch initial data when receiving this event.
 */
export interface RecoveryGapMarker {
  _gap: true;
  lastSeenVersion?: number;
}

/**
 * Result type for subscription generators.
 * Can be either the actual event data (T) or a RecoveryGapMarker.
 */
export type SubscriptionResult<T> = T | RecoveryGapMarker | null;

/**
 * Type guard to check if a subscription result is a gap marker.
 * @param result - The subscription result to check
 * @returns true if result is a RecoveryGapMarker
 */
export function isGapMarker<T>(result: SubscriptionResult<T>): result is RecoveryGapMarker {
  return (result as RecoveryGapMarker)._gap;
}

/**
 * Creates a subscription iterator with built-in message recovery support.
 * Handles version tracking and recovery automatically.
 *
 * @param divisionId - The division to subscribe to
 * @param eventTypes - The event types to listen for
 * @param lastSeenVersion - The last version seen by the client (for recovery)
 * @returns AsyncGenerator that yields events with automatic recovery handling
 */
export async function createSubscriptionIterator(
  divisionId: string,
  eventType: RedisEventTypes,
  lastSeenVersion: number = 0
) {
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, eventType, lastSeenVersion);
}
