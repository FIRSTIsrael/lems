import { gql, TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { QueryData } from '../query';

interface SubscriptionVars {
  divisionId: string;
}

export interface MatchUpdatedEvent {
  id: string;
  called: boolean;
}

export interface MatchUpdatedData {
  matchUpdated: MatchUpdatedEvent;
}

export const MATCH_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  MatchUpdatedData,
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
    subscription: MATCH_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, subscriptionData: { data?: unknown }) => {
      const data = subscriptionData.data as MatchUpdatedData | undefined;
      if (!data || !prev.division) return prev;
      
      const updatedMatchId = data.matchUpdated.id;
      const updatedCalled = data.matchUpdated.called;

      return {
        ...prev,
        division: {
          ...prev.division,
          field: {
            ...prev.division.field,
            matches: prev.division.field.matches.map(match =>
              match.id === updatedMatchId
                ? { ...match, called: updatedCalled }
                : match
            )
          }
        }
      };
    }
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}
