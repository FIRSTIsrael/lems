import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface ParticipantStatusUpdatedSubscribeArgs {
  divisionId: string;
}

interface ParticipantStatusUpdatedEvent {
  participantId: string;
  queued: string | null;
  present: string | null;
  ready: string | null;
}

const processParticipantStatusUpdatedEvent = async (
  event: Record<string, unknown>
): Promise<ParticipantStatusUpdatedEvent | null> => {
  const eventData = event.data as Record<string, unknown>;
  const participantId = (eventData.participantId as string) || '';
  const queued = eventData.queued;
  const present = eventData.present;
  const ready = eventData.ready;

  if (!participantId) {
    return null;
  }

  // Convert Date objects to ISO strings
  const convertToISOString = (value: unknown): string | null => {
    if (!value) return null;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') return value;
    return null;
  };

  const result: ParticipantStatusUpdatedEvent = {
    participantId,
    queued: convertToISOString(queued),
    present: convertToISOString(present),
    ready: convertToISOString(ready)
  };

  return result;
};

const participantStatusUpdatedSubscribe = (
  _root: unknown,
  { divisionId }: ParticipantStatusUpdatedSubscribeArgs
) => {
  if (!divisionId) throw new Error('divisionId is required');
  const pubSub = getRedisPubSub();
  return pubSub.asyncIterator(divisionId, RedisEventTypes.PARTICIPANT_STATUS_UPDATED);
};

/**
 * Subscription resolver object for participantStatusUpdated
 * Emitted when any participant status field is updated (queued, present, ready)
 * Called by field head queuer when marking teams as queued/arrived
 * Called by referees when marking teams as present or ready
 */
export const participantStatusUpdatedResolver = {
  subscribe: participantStatusUpdatedSubscribe,
  resolve: processParticipantStatusUpdatedEvent
};
