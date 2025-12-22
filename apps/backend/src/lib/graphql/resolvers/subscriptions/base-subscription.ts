import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../redis/redis-pubsub';

/**
 * Base arguments for all subscriptions.
 * Every subscription should extend this interface for consistency.
 */
export interface BaseSubscriptionArgs {
  divisionId: string;
}

/**
 * Result type for subscription generators.
 */
export type SubscriptionResult<T> = T | null;

/**
 * Creates a subscription iterator for real-time events.
 *
 * @param divisionId - The division to subscribe to
 * @param eventType - The event type to listen for
 * @returns AsyncGenerator that yields events
 */
export async function createSubscriptionIterator(divisionId: string, eventType: RedisEventTypes) {
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, eventType);
}
