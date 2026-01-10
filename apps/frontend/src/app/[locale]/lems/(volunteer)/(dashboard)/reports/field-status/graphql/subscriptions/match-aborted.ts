import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { FieldStatusData } from '../types';

export interface MatchAbortedEvent {
  matchId: string;
}

export interface MatchAbortedSubscriptionData {
  matchAborted: MatchAbortedEvent;
}

interface SubscriptionVars {
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
 * Creates a subscription configuration for match aborted events in the field status view.
 * When a match is aborted, updates the match status back to not-started.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchAbortedSubscription(divisionId: string) {
  return {
    subscription: MATCH_ABORTED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: FieldStatusData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as MatchAbortedSubscriptionData).matchAborted;
      return merge(prev, {
        division: {
          field: {
            activeMatch: null,
            matches: prev.division.field.matches.map(match =>
              match.id === event.matchId
                ? {
                    ...match,
                    status: 'not-started' as const,
                    startTime: null,
                    startDelta: null
                  }
                : match
            )
          }
        }
      });
    }
  };
}
