import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface MatchStageAdvancedSubscribeArgs {
  divisionId: string;
}

const processMatchStageAdvancedEvent = async (): Promise<void> => {
  return;
};

const matchStageAdvancedSubscribe = (
  _root: unknown,
  { divisionId }: MatchStageAdvancedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.MATCH_STAGE_ADVANCED);
};

/**
 * Subscription resolver object for matchStageAdvanced
 * GraphQL subscriptions require a subscribe function
 */
export const matchStageAdvancedResolver = {
  subscribe: matchStageAdvancedSubscribe,
  resolve: processMatchStageAdvancedEvent
};
