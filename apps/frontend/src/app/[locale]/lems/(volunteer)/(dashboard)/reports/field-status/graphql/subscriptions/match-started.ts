import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { FieldStatusData } from '../types';

export interface MatchStartedEvent {
  matchId: string;
  startTime: string;
  startDelta: number;
}

export interface MatchStartedSubscriptionData {
  matchStarted: MatchStartedEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const MATCH_STARTED_SUBSCRIPTION: TypedDocumentNode<
  MatchStartedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchStarted($divisionId: String!) {
    matchStarted(divisionId: $divisionId) {
      matchId
      startTime
      startDelta
    }
  }
`;

/**
 * Creates a subscription configuration for match started events in the field status view.
 * When a match is started, updates the match status and timing information.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchStartedSubscription(divisionId: string) {
  return {
    subscription: MATCH_STARTED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: FieldStatusData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as MatchStartedSubscriptionData).matchStarted;
      return merge(prev, {
        division: {
          field: {
            activeMatch: event.matchId,
            matches: prev.division.field.matches.map(match =>
              match.id === event.matchId
                ? {
                    ...match,
                    status: 'in-progress' as const,
                    startTime: event.startTime,
                    startDelta: event.startDelta
                  }
                : match
            )
          }
        }
      });
    }
  };
}
