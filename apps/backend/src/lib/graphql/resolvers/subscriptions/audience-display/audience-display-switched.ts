import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { AudienceDisplayScreen } from '@lems/database';
import {
  createSubscriptionIterator,
  SubscriptionResult,
  BaseSubscriptionArgs,
  isGapMarker
} from '../base-subscription';

interface AudienceDisplaySwitchedEvent {
  activeDisplay: AudienceDisplayScreen;
  version: number;
}

const processAudienceDisplaySwitchedEvent = async (
  event: Record<string, unknown>
): Promise<SubscriptionResult<AudienceDisplaySwitchedEvent>> => {
  // Check for gap marker (recovery buffer exceeded)
  if (isGapMarker(event.data)) {
    console.warn('[AudienceDisplaySwitched] Recovery gap detected - client should refetch');
    return event.data;
  }

  const eventData = event.data as Record<string, unknown>;
  const activeDisplay = (eventData.activeDisplay as AudienceDisplayScreen) || '';

  if (!activeDisplay) {
    return null;
  }

  const result: AudienceDisplaySwitchedEvent = {
    activeDisplay,
    version: (event.version as number) ?? 0
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

  const lastSeenVersion = (args.lastSeenVersion as number) || 0;
  return createSubscriptionIterator(
    divisionId,
    RedisEventTypes.AUDIENCE_DISPLAY_SWITCHED,
    lastSeenVersion
  );
};

/**
 * Subscription resolver object for judgingSessionAborted
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
