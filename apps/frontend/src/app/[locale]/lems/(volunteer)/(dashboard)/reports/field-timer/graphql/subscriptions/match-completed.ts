import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { QueryData, MatchCompletedSubscriptionData, SubscriptionVars } from '../types';

export const MATCH_COMPLETED_SUBSCRIPTION: TypedDocumentNode<
  MatchCompletedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchCompleted($divisionId: String!) {
    matchCompleted(divisionId: $divisionId) {
      matchId
    }
  }
`;

const matchCompletedReconciler: Reconciler<QueryData, MatchCompletedSubscriptionData> = (
  prev,
  { data }
) => {
  if (!data || !prev.division?.field) return prev;

  const { matchId } = data.matchCompleted;

  return merge(prev, {
    division: {
      id: prev.division.id,
      field: {
        ...prev.division.field,
        activeMatch: null,
        matches: prev.division.field.matches.map(match =>
          match.id === matchId ? merge(match, { status: 'completed' }) : match
        )
      }
    }
  });
};

export function createMatchCompletedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: MATCH_COMPLETED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: matchCompletedReconciler as (
      prev: QueryData,
      subscriptionData: { data?: unknown }
    ) => QueryData
  };
}
