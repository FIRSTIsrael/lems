import { gql, TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { QueryData } from '../query';

interface SubscriptionVars {
  divisionId: string;
}

export interface ParticipantStatusUpdatedEvent {
  participantId: string;
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
      present
      ready
    }
  }
`;

export function createParticipantStatusUpdatedSubscription(divisionId: string) {
  return {
    subscription: PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, subscriptionData: { data?: unknown }) => {
      const data = subscriptionData.data as ParticipantStatusUpdatedData | undefined;
      if (!data || !prev.division) return prev;
      
      const { participantId, present, ready } = data.participantStatusUpdated;

      return {
        ...prev,
        division: {
          ...prev.division,
          field: {
            ...prev.division.field,
            matches: prev.division.field.matches.map(match => {
              return {
                ...match,
                participants: match.participants.map(participant => {
                  if (participant.id !== participantId) return participant;
                  
                  return {
                    ...participant,
                    present: present !== null,
                    ready: ready !== null
                  };
                })
              };
            })
          }
        }
      };
    }
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}
