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
 * Result type for subscription generators.
 * All subscription generators should yield objects that extend this.
 */
export interface BaseSubscriptionResult {
  [key: string]: unknown;
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

/**
 * Helper to check if an event is a gap marker (recovery buffer exceeded).
 * When a gap is detected, the client should refetch initial data.
 *
 * @param event - The event data to check
 * @returns true if event is a gap marker
 */
export function isRecoveryGapMarker(event: Record<string, unknown>): boolean {
  return !!event._gap;
}
