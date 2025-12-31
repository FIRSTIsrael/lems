import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { QueryData, MatchStartedSubscriptionData, SubscriptionVars } from '../types';

export const MATCH_STARTED_SUBSCRIPTION: TypedDocumentNode<
  MatchStartedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchStarted($divisionId: String!) {
    matchStarted(divisionId: $divisionId) {
      matchId
      startTime
      startDelta
    }
  }
`;

const matchStartedReconciler: Reconciler<QueryData, MatchStartedSubscriptionData> = (
  prev,
  { data }
) => {
  if (!data || !prev.division?.field) return prev;

  const { matchId, startTime, startDelta } = data.matchStarted;

  return merge(prev, {
    division: {
      id: prev.division.id,
      field: {
        ...prev.division.field,
        activeMatch: matchId,
        matches: prev.division.field.matches.map(match =>
          match.id === matchId
            ? merge(match, { status: 'in-progress', startTime, startDelta })
            : match
        )
      }
    }
  });
};

export function createMatchStartedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: MATCH_STARTED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: matchStartedReconciler as (
      prev: QueryData,
      subscriptionData: { data?: unknown }
    ) => QueryData
  };
}
