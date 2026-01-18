import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { FieldStatusData } from '../types';

export interface MatchLoadedEvent {
  matchId: string;
}

export interface MatchLoadedSubscriptionData {
  matchLoaded: MatchLoadedEvent;
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
 * Creates a subscription configuration for match loaded events in the field status view.
 * When a match is loaded, updates the field state to reflect the new loaded match.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchLoadedSubscription(divisionId: string) {
  return {
    subscription: MATCH_LOADED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: FieldStatusData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as MatchLoadedSubscriptionData).matchLoaded;
      return merge(prev, {
        division: {
          field: {
            loadedMatch: event.matchId
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, FieldStatusData, SubscriptionVars>;
}
