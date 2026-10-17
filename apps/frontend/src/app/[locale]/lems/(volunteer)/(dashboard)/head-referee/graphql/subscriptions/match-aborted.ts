import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateById } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { HeadRefereeData } from '../types';

export interface MatchAbortedSubscriptionData {
  matchAborted: {
    matchId: string;
  };
}

export interface SubscriptionVars {
  divisionId: string;
}

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

/**
 * Creates a subscription configuration for match aborted events.
 * Clears the active match and returns the aborted match to not-started.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchAbortedSubscription(divisionId: string) {
  return {
    subscription: MATCH_ABORTED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: HeadRefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field?.matches || !data) return prev;

      const matchId = (data as MatchAbortedSubscriptionData).matchAborted.matchId;
      const match = prev.division.field.matches.find(candidate => candidate.id === matchId);
      if (!match) return prev;

      return merge(prev, {
        division: {
          field: {
            activeMatch: null,
            loadedMatch: (match.stage as string) === 'TEST' ? null : match.id,
            matches: updateById(prev.division.field.matches, matchId, current => ({
              ...current,
              status: 'not-started',
              startTime: undefined
            }))
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, HeadRefereeData, SubscriptionVars>;
}
