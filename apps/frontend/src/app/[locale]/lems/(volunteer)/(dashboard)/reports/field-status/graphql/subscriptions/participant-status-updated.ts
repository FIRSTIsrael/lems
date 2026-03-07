import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { FieldStatusData } from '../types';

export interface ParticipantStatusUpdatedEvent {
  participantId: string;
  queued: string | null;
  present: string | null;
  ready: string | null;
}

export interface ParticipantStatusUpdatedSubscriptionData {
  participantStatusUpdated: ParticipantStatusUpdatedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  ParticipantStatusUpdatedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription ParticipantStatusUpdated($divisionId: String!) {
    participantStatusUpdated(divisionId: $divisionId) {
      participantId
      queued
      present
      ready
    }
  }
`;

export function createParticipantStatusUpdatedSubscription(divisionId: string) {
  return {
    subscription: PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: FieldStatusData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as ParticipantStatusUpdatedSubscriptionData).participantStatusUpdated;
      return merge(prev, {
        division: {
          field: {
            matches: prev.division.field.matches.map(match => {
              return {
                ...match,
                participants: match.participants.map(p =>
                  p.id === event.participantId
                    ? {
                        ...p,
                        queued: event.queued !== null,
                        present: event.present !== null,
                        ready: event.ready !== null
                      }
                    : p
                )
              };
            })
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, FieldStatusData, SubscriptionVars>;
}
