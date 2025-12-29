import { RedisEventTypes } from '@lems/types/api/lems/redis';
import { getRedisPubSub } from '../../../../redis/redis-pubsub';

interface ParticipantStatusUpdatedSubscribeArgs {
  divisionId: string;
}

interface ParticipantStatusUpdatedEvent {
  participantId: string;
  present: Date | null;
  ready: Date | null;
}

const processParticipantStatusUpdatedEvent = async (
  event: Record<string, unknown>
): Promise<ParticipantStatusUpdatedEvent | null> => {
  const eventData = event.data as Record<string, unknown>;
  const participantId = (eventData.participantId as string) || '';
  const present = (eventData.present as string | null) || null;
  const ready = (eventData.ready as string | null) || null;

  if (!participantId) {
    return null;
  }

  const result: ParticipantStatusUpdatedEvent = {
    participantId,
    present: present ? new Date(present) : null,
    ready: ready ? new Date(ready) : null
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
 * Emitted when a referee updates a participant's status (present/ready) in a match
 */
export const participantStatusUpdatedResolver = {
  subscribe: participantStatusUpdatedSubscribe,
  resolve: processParticipantStatusUpdatedEvent
};
