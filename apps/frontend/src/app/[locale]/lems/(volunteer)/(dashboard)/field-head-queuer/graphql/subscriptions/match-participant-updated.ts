import { gql, type TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { QueryData } from '../query';

interface SubscriptionVars {
  divisionId: string;
}

export interface MatchParticipantUpdatedEvent {
  matchId: string;
  teamId: string;
  queued: string | null;
  present: string | null;
  ready: string | null;
}

export interface MatchParticipantUpdatedSubscriptionData {
  matchParticipantUpdated: MatchParticipantUpdatedEvent;
}

export const MATCH_PARTICIPANT_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  MatchParticipantUpdatedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchParticipantUpdated($divisionId: String!) {
    matchParticipantUpdated(divisionId: $divisionId) {
      matchId
      teamId
      queued
      present
      ready
    }
  }
`;

export function createMatchParticipantUpdatedSubscription(divisionId: string) {
  return {
    subscription: MATCH_PARTICIPANT_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData) => {
      // Trigger refetch by returning a new object reference
      return { ...prev };
    }
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}
