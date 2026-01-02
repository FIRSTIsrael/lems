import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { MatchEvent, ScoreboardData } from '../types';

interface MatchLoadedSubscriptionData {
  matchLoaded: MatchEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const MATCH_LOADED_SUBSCRIPTION: TypedDocumentNode<
  MatchLoadedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchLoaded($divisionId: String!) {
    matchLoaded(divisionId: $divisionId) {
      matchId
    }
  }
`;

export function createMatchLoadedSubscription(divisionId: string) {
  return {
    subscription: MATCH_LOADED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ScoreboardData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      return merge(prev, {
        division: {
          field: {
            loadedMatch: (data as MatchLoadedSubscriptionData).matchLoaded.matchId
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, ScoreboardData, SubscriptionVars>;
}
