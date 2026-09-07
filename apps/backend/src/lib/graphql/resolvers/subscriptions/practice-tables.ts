import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../redis/redis-pubsub.js';

interface PracticeTableAssignmentsUpdatedArgs {
  divisionId: string;
}

interface PracticeTablesConfigUpdatedArgs {
  divisionId: string;
}

/**
 * Subscribe function for practiceTableAssignmentsUpdated
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
 * Returns the assignments array from the Redis event
 */
const processPracticeTableAssignmentsEvent = async (
  event: Record<string, unknown>
): Promise<unknown[]> => {
  const assignments = (event.data as unknown[]) || [];
  return assignments;
};

/**
 * Subscribe function for practiceTablesConfigUpdated
 */
const practiceTablesConfigUpdatedSubscribe = (
  _root: unknown,
  { divisionId }: PracticeTablesConfigUpdatedArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.PRACTICE_TABLES_CONFIG_UPDATED);
};

/**
 * Resolve function for practiceTablesConfigUpdated
 * Returns the config object from the Redis event
 */
const processPracticeTablesConfigEvent = async (
  event: Record<string, unknown>
): Promise<unknown> => {
  return event.data || null;
};

/**
 * Subscription resolver objects
 */
export const practiceTableSubscriptions = {
  practiceTableAssignmentsUpdated: {
    subscribe: practiceTableAssignmentsUpdatedSubscribe,
    resolve: processPracticeTableAssignmentsEvent
  },
  practiceTablesConfigUpdated: {
    subscribe: practiceTablesConfigUpdatedSubscribe,
    resolve: processPracticeTablesConfigEvent
  }
};
