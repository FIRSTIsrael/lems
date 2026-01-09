import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface FinalDeliberationStatusChangedArgs {
  divisionId: string;
}

/**
 * Resolver for Subscription.finalDeliberationStatusChanged
 * Subscribes to status changes for the final deliberation of a specific division
 */
export const finalDeliberationStatusChangedResolver = (
  _root: unknown,
  { divisionId }: FinalDeliberationStatusChangedArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.FINAL_DELIBERATION_STATUS_CHANGED);
};
