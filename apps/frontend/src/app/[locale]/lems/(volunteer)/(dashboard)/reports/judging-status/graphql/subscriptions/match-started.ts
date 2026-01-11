import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { SubscriptionVars, QueryData } from '../types';

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

export function createMatchStartedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: MATCH_STARTED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) => {
      if (!data || !prev.division) return prev;

      const { matchId } = (data as SubscriptionData).matchStarted;

      return merge(prev, {
        division: {
          ...prev.division,
          field: {
            activeMatch: matchId,
            loadedMatch: null
          }
        }
      });
    }
  };
}
