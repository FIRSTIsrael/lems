import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { MatchEvent, ScorekeeperData } from '../types';

export interface MatchLoadedSubscriptionData {
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

/**
 * Creates a subscription configuration for match loaded events in the scorekeeper view.
 * When a match is loaded, updates the loadedMatch field in the field data.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchLoadedSubscription(divisionId: string) {
  return {
    subscription: MATCH_LOADED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ScorekeeperData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      return merge(prev, {
        division: {
          field: {
            loadedMatch: (data as MatchLoadedSubscriptionData).matchLoaded.matchId
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, ScorekeeperData, SubscriptionVars>;
}
