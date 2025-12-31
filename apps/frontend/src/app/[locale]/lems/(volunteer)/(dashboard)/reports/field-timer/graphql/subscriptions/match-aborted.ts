import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { QueryData, MatchAbortedSubscriptionData, SubscriptionVars } from '../types';

export const MATCH_ABORTED_SUBSCRIPTION: TypedDocumentNode<
  MatchAbortedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchAborted($divisionId: String!) {
    matchAborted(divisionId: $divisionId) {
      matchId
    }
  }
`;

const matchAbortedReconciler: Reconciler<QueryData, MatchAbortedSubscriptionData> = (
  prev,
  { data }
) => {
  if (!data || !prev.division?.field) return prev;

  const { matchId } = data.matchAborted;

  return merge(prev, {
    division: {
      id: prev.division.id,
      field: {
        ...prev.division.field,
        activeMatch: null,
        matches: prev.division.field.matches.map(match =>
          match.id === matchId
            ? merge(match, { status: 'not-started', startTime: null, startDelta: null })
            : match
        )
      }
    }
  });
};

export function createMatchAbortedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: MATCH_ABORTED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: matchAbortedReconciler as (
      prev: QueryData,
      subscriptionData: { data?: unknown }
    ) => QueryData
  };
}
