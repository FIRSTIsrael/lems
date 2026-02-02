import { gql, type TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { QueryData } from '../query';

interface SubscriptionVars {
  divisionId: string;
}

export interface MatchUpdatedEvent {
  id: string;
  called: boolean;
}

export interface MatchUpdatedSubscriptionData {
  matchUpdated: MatchUpdatedEvent;
}

export const MATCH_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  MatchUpdatedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchUpdated($divisionId: String!) {
    matchUpdated(divisionId: $divisionId) {
      id
      called
    }
  }
`;

export function createMatchUpdatedSubscription(divisionId: string) {
  return {
    subscription: MATCH_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData) => {
      // Trigger refetch by returning a new object reference
      return { ...prev };
    }
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}
