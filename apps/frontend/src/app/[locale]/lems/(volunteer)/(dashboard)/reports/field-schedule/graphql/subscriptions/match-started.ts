import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { QueryData } from '../types';

interface SubscriptionVars {
  divisionId: string;
}

interface SubscriptionData {
  matchStarted: {
    matchId: string;
  };
}

export const MATCH_STARTED_SUBSCRIPTION: TypedDocumentNode<SubscriptionData, SubscriptionVars> =
  gql`
    subscription MatchStarted($divisionId: String!) {
      matchStarted(divisionId: $divisionId) {
        matchId
      }
    }
  `;

const matchStartedReconciler: Reconciler<QueryData, SubscriptionData> = (prev, { data }) => {
  if (!data) return prev;

  const { matchId } = data.matchStarted;

  return merge(prev, {
    division: {
      field: {
        matches: prev.division.field.matches.map(match =>
          match.id === matchId ? merge(match, { status: 'in-progress' as const }) : match
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
    subscriptionVariables: { divisionId },
    updateQuery: matchStartedReconciler as (
      prev: QueryData,
      subscriptionData: { data?: unknown }
    ) => QueryData
  };
}
