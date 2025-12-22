import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { AudienceDisplayScreen } from '@lems/database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface AudienceDisplaySwitchedSubscribeArgs {
  divisionId: string;
}

interface AudienceDisplaySwitchedEvent {
  activeDisplay: AudienceDisplayScreen;
}

const processAudienceDisplaySwitchedEvent = async (
  event: Record<string, unknown>
): Promise<AudienceDisplaySwitchedEvent | null> => {
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
  { divisionId }: AudienceDisplaySwitchedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.AUDIENCE_DISPLAY_SWITCHED);
};

/**
 * Subscription resolver object for audeinceDisplaySwitched
 * GraphQL subscriptions require a subscribe function
 */
export const audienceDisplaySwitchedResolver = {
  subscribe: audienceDisplaySwitchedSubscribe,
  resolve: processAudienceDisplaySwitchedEvent
};
