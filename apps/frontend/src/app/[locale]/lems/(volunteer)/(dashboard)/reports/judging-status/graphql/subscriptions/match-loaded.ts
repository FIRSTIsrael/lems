import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { SubscriptionVars, QueryData, RobotGameMatch } from '../types';

interface SubscriptionData {
  matchLoaded: {
    matchId: string;
  };
}

export const MATCH_LOADED_SUBSCRIPTION: TypedDocumentNode<SubscriptionData, SubscriptionVars> = gql`
  subscription MatchLoaded($divisionId: String!) {
    matchLoaded(divisionId: $divisionId) {
      matchId
    }
  }
`;

export function createMatchLoadedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: MATCH_LOADED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) => {
      if (!data || !prev.division) return prev;

      const { matchId } = (data as SubscriptionData).matchLoaded;

      return merge(prev, {
        division: {
          ...prev.division,
          field: {
            ...prev.division.field,
            loadedMatch: matchId
          }
        }
      });
    }
  };
}
