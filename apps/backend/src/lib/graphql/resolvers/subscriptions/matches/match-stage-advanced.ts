import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from '../base-subscription';

const processMatchStageAdvancedEvent = async (): Promise<SubscriptionResult<never>> => {
  return;
};

const matchStageAdvancedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for matchStageAdvanced subscription';
    throw new Error(errorMsg);
  }

  return createSubscriptionIterator(divisionId, RedisEventTypes.MATCH_STAGE_ADVANCED);
};

/**
 * Subscription resolver object for matchStageAdvanced
 * GraphQL subscriptions require a subscribe function
 */
export const matchStageAdvancedResolver = {
  subscribe: matchStageAdvancedSubscribe,
  resolve: async (): Promise<SubscriptionResult<never>> => {
    return processMatchStageAdvancedEvent();
  }
};
