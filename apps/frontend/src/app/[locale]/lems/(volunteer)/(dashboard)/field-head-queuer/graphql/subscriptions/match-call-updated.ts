import { gql, type TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { QueryData } from '../query';

interface SubscriptionVars {
  divisionId: string;
}

export interface MatchCallUpdatedEvent {
  id: string;
  called: boolean;
}

export interface MatchCallUpdatedSubscriptionData {
  matchUpdated: MatchCallUpdatedEvent;
}

export const MATCH_CALL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  MatchCallUpdatedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchUpdated($divisionId: String!) {
    matchUpdated(divisionId: $divisionId) {
      id
      called
    }
  }
`;

export function createMatchCallUpdatedSubscription(divisionId: string) {
  return {
    subscription: MATCH_CALL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData) => {
      // Trigger refetch by returning a new object reference
      return { ...prev };
    }
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}
