import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { FieldStatusData } from '../types';

export interface MatchCompletedEvent {
  matchId: string;
  autoLoadedMatchId: string | null;
}

export interface MatchCompletedSubscriptionData {
  matchCompleted: MatchCompletedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const MATCH_COMPLETED_SUBSCRIPTION: TypedDocumentNode<
  MatchCompletedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchCompleted($divisionId: String!) {
    matchCompleted(divisionId: $divisionId) {
      matchId
      autoLoadedMatchId
    }
  }
`;

/**
 * Creates a subscription configuration for match completed events in the field status view.
 * When a match is completed, updates the match status and potentially loads the next match.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchCompletedSubscription(divisionId: string) {
  return {
    subscription: MATCH_COMPLETED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: FieldStatusData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as MatchCompletedSubscriptionData).matchCompleted;
      return merge(prev, {
        division: {
          field: {
            activeMatch: null,
            loadedMatch: event.autoLoadedMatchId,
            matches: prev.division.field.matches.map(match =>
              match.id === event.matchId
                ? {
                    ...match,
                    status: 'completed' as const
                  }
                : match
            )
          }
        }
      });
    }
  };
}
