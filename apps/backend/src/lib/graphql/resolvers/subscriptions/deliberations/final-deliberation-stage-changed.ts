import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface FinalDeliberationStageChangedArgs {
  divisionId: string;
}

/**
 * Resolver for Subscription.finalDeliberationStageChanged
 * Subscribes to stage changes for the final deliberation of a specific division
 */
export const finalDeliberationStageChangedResolver = (
  _root: unknown,
  { divisionId }: FinalDeliberationStageChangedArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.FINAL_DELIBERATION_STAGE_CHANGED);
};
