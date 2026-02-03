import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface MatchParticipantUpdatedSubscribeArgs {
  divisionId: string;
}

interface MatchParticipantUpdatedEvent {
  matchId: string;
  teamId: string;
  queued: string | null;
  present: Date | null;
  ready: Date | null;
}

const processMatchParticipantUpdatedEvent = async (
  event: Record<string, unknown>
): Promise<MatchParticipantUpdatedEvent | null> => {
  const eventData = event.data as Record<string, unknown>;
  const matchId = (eventData.matchId as string) || '';
  const teamId = (eventData.teamId as string) || '';
  const queued = eventData.queued;
  const present = (eventData.present as string | null) || null;
  const ready = (eventData.ready as string | null) || null;

  if (!matchId || !teamId) {
    return null;
  }

  // Handle queued field - it might be a Date, string, or null
  let queuedString: string | null = null;
  if (queued) {
    if (queued instanceof Date) {
      queuedString = queued.toISOString();
    } else if (typeof queued === 'string') {
      queuedString = queued;
    }
  }

  const result: MatchParticipantUpdatedEvent = {
    matchId,
    teamId,
    queued: queuedString,
    present: present ? new Date(present) : null,
    ready: ready ? new Date(ready) : null
  };

  return result;
};

const matchParticipantUpdatedSubscribe = (
  _root: unknown,
  { divisionId }: MatchParticipantUpdatedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.MATCH_PARTICIPANT_UPDATED);
};

/**
 * Subscription resolver object for matchParticipantUpdated
 * Emitted when any participant field is updated (queued, present, ready)
 * Consolidates both match participant updates and status updates
 */
export const matchParticipantUpdatedResolver = {
  subscribe: matchParticipantUpdatedSubscribe,
  resolve: processMatchParticipantUpdatedEvent
};
