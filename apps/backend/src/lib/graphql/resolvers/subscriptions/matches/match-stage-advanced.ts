import { RedisEventTypes } from '@lems/types/api/lems/redis';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';

interface MatchStageAdvancedEvent {
  version: number;
}

const processMatchStageAdvancedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<MatchStageAdvancedEvent>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[MatchStageAdvanced] Recovery gap detected - client should refetch');
    return event.data;
  }

  const result: MatchStageAdvancedEvent = {
    version: (event.version as number) ?? 0
  };

  return result;
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

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(
    divisionId,
    RedisEventTypes.MATCH_STAGE_ADVANCED,
    lastSeenVersion
  );
};

/**
 * Subscription resolver object for matchStageAdvanced
 * GraphQL subscriptions require a subscribe function
 */
export const matchStageAdvancedResolver = {
  subscribe: matchStageAdvancedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<MatchStageAdvancedEvent>> => {
    return processMatchStageAdvancedEvent(event);
  }
};
