import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateById } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { HeadRefereeData } from '../types';

export interface MatchCompletedSubscriptionData {
  matchCompleted: {
    matchId: string;
  };
}

export interface SubscriptionVars {
  divisionId: string;
}

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

/**
 * Creates a subscription configuration for match completed events.
 * Updates the match status when a match is completed and clears the loaded match.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchCompletedSubscription(divisionId: string) {
  return {
    subscription: MATCH_COMPLETED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: HeadRefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field?.matches || !data) return prev;

      const completedData = (data as MatchCompletedSubscriptionData).matchCompleted;
      const completedMatchId = completedData.matchId;

      return merge(prev, {
        division: {
          field: {
            matches: updateById(prev.division.field.matches, completedMatchId, match => ({
              ...match,
              status: 'completed'
            }))
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, HeadRefereeData, SubscriptionVars>;
}
