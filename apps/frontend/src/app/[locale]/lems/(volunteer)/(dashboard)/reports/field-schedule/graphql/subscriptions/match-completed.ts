import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { QueryData } from '../types';

interface SubscriptionVars {
  divisionId: string;
}

interface SubscriptionData {
  matchCompleted: {
    matchId: string;
    autoLoadedMatchId?: string;
  };
}

export const MATCH_COMPLETED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchCompleted($divisionId: String!) {
    matchCompleted(divisionId: $divisionId) {
      matchId
      autoLoadedMatchId
    }
  }
`;

const matchCompletedReconciler: Reconciler<QueryData, SubscriptionData> = (prev, { data }) => {
  if (!data) return prev;

  const { matchId } = data.matchCompleted;

  return merge(prev, {
    division: {
      field: {
        matches: prev.division.field.matches.map(match =>
          match.id === matchId ? merge(match, { status: 'completed' as const }) : match
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
    subscriptionVariables: { divisionId },
    updateQuery: matchCompletedReconciler as (
      prev: QueryData,
      subscriptionData: { data?: unknown }
    ) => QueryData
  };
}
