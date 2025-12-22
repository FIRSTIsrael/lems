import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface MatchStartedSubscribeArgs {
  divisionId: string;
}

interface MatchStartedEvent {
  matchId: string;
  startTime: string;
  startDelta: number;
}

const processMatchStartedEvent = async (
  event: Record<string, unknown>
): Promise<MatchStartedEvent | null> => {
  const eventData = event.data as Record<string, unknown>;
  const matchId = (eventData.matchId as string) || '';
  const startTime = (eventData.startTime as string) || '';
  const startDelta = (eventData.startDelta as number) ?? 0;

  if (!matchId || !startTime) {
    return null;
  }

  const result: MatchStartedEvent = {
    matchId,
    startTime,
    startDelta
  };

  return result;
};

const matchStartedSubscribe = (_root: unknown, { divisionId }: MatchStartedSubscribeArgs) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.MATCH_STARTED);
};

/**
 * Subscription resolver object for matchStarted
 * GraphQL subscriptions require a subscribe function
 */
export const matchStartedResolver = {
  subscribe: matchStartedSubscribe,
  resolve: processMatchStartedEvent
};
