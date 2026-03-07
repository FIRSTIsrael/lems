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
    updateQuery: (
      prev: QueryData,
      { subscriptionData }: { subscriptionData?: { data?: unknown } }
    ) => {
      if (!subscriptionData) {
        return prev;
      }

      const data = subscriptionData.data as MatchCallUpdatedSubscriptionData | undefined;

      if (!data || !prev.division) {
        return prev;
      }

      const { matchUpdated } = data;

      return {
        ...prev,
        division: {
          ...prev.division,
          field: {
            ...prev.division.field,
            matches: prev.division.field.matches.map(match =>
              match.id === matchUpdated.id ? { ...match, called: matchUpdated.called } : match
            )
          }
        }
      };
    }
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}
