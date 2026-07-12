import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { HeadRefereeData } from '../types';

interface SubscriptionVars {
  divisionId: string;
}

export interface ParticipantStatusUpdatedEvent {
  participantId: string;
  queued: string | null;
  present: string | null;
  ready: string | null;
}

export interface ParticipantStatusUpdatedData {
  participantStatusUpdated: ParticipantStatusUpdatedEvent;
}

export const PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  ParticipantStatusUpdatedData,
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
    updateQuery: (prev: HeadRefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as ParticipantStatusUpdatedData).participantStatusUpdated;
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
  } as SubscriptionConfig<unknown, HeadRefereeData, SubscriptionVars>;
}
