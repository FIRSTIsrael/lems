import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { AudienceDisplayScreen } from '@lems/database';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs
} from '../base-subscription';

interface AudienceDisplaySwitchedEvent {
  activeDisplay: AudienceDisplayScreen;
}

const processAudienceDisplaySwitchedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<AudienceDisplaySwitchedEvent>> => {
  const eventData = event.data as Record<string, unknown>;
  const activeDisplay = (eventData.activeDisplay as AudienceDisplayScreen) || '';

  if (!activeDisplay) {
    return null;
  }

  const result: AudienceDisplaySwitchedEvent = {
    activeDisplay
  };

  return result;
};

const audienceDisplaySwitchedSubscribe = (
  _root: unknown,
  args: BaseSubscriptionArgs & Record<string, unknown>
) => {
  const divisionId = args.divisionId as string;

  if (!divisionId) {
    const errorMsg = 'divisionId is required for audienceDisplaySwitched subscription';
    throw new Error(errorMsg);
  }

  return createSubscriptionIterator(divisionId, RedisEventTypes.AUDIENCE_DISPLAY_SWITCHED);
};

/**
 * Subscription resolver object for audeinceDisplaySwitched
 * GraphQL subscriptions require a subscribe function
 */
export const audienceDisplaySwitchedResolver = {
  subscribe: audienceDisplaySwitchedSubscribe,
  resolve: async (
    event: Record<string, unknown>
  ): Promise<SubscriptionResult<AudienceDisplaySwitchedEvent>> => {
    return processAudienceDisplaySwitchedEvent(event);
  }
};
