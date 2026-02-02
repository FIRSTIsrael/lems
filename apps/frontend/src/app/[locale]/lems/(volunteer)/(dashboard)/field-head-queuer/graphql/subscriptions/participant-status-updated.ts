import { gql, type TypedDocumentNode } from '@apollo/client';
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

export interface ParticipantStatusUpdatedSubscriptionData {
  participantStatusUpdated: ParticipantStatusUpdatedEvent;
}

export const PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  ParticipantStatusUpdatedSubscriptionData,
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
    updateQuery: (prev: QueryData) => {
      // Trigger refetch by returning a new object reference
      return { ...prev };
    }
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}
