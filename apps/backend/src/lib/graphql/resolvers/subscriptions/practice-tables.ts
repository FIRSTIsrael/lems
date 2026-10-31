import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../redis/redis-pubsub.js';

interface PracticeTableAssignmentsUpdatedArgs {
  divisionId: string;
}

/**
 * Subscribe function for practiceTableAssignmentsUpdated
 * Subscribes to ALL assignment updates for a division
 */
const practiceTableAssignmentsUpdatedSubscribe = (
  _root: unknown,
  { divisionId }: PracticeTableAssignmentsUpdatedArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.PRACTICE_TABLE_ASSIGNMENTS_UPDATED);
};

/**
 * Resolve function for practiceTableAssignmentsUpdated
 * Returns the COMPLETE list of all assignments for the division
 *
 * Note: Unlike other subscriptions that return only changed items,
 * this returns the full assignment list to ensure UI consistency.
 * The mutation publishes all assignments via practiceTablesScheduleResolver.
 */
const processPracticeTableAssignmentsEvent = async (
  event: Record<string, unknown>
): Promise<unknown[]> => {
  // The event.data contains the full array of assignments from the mutation
  const assignments = (event.data as unknown[]) || [];
  return assignments;
};

/**
 * Subscription resolver objects
 */
export const practiceTableSubscriptions = {
  practiceTableAssignmentsUpdated: {
    subscribe: practiceTableAssignmentsUpdatedSubscribe,
    resolve: processPracticeTableAssignmentsEvent
  }
};
