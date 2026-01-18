import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { AwardsPresentation } from '@lems/database';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface PresentationUpdatedSubscribeArgs {
  divisionId: string;
}

interface PresentationUpdatedEvent {
  awardsPresentation: AwardsPresentation;
}

const processPresentationUpdatedEvent = async (
  event: Record<string, unknown>
): Promise<PresentationUpdatedEvent | null> => {
  const eventData = event.data as Record<string, unknown>;
  const awardsPresentation = (eventData.awardsPresentation as AwardsPresentation) || '';

  if (!awardsPresentation) {
    return null;
  }

  const result: PresentationUpdatedEvent = {
    awardsPresentation
  };

  return result;
};

const presentationUpdatedSubscribe = (
  _root: unknown,
  { divisionId }: PresentationUpdatedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.AWARDS_PRESENTATION_UPDATED);
};

/**
 * Subscription resolver object for presentationUpdated
 * GraphQL subscriptions require a subscribe function
 */
export const presentationUpdatedResolver = {
  subscribe: presentationUpdatedSubscribe,
  resolve: processPresentationUpdatedEvent
};
