import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import { Match, MatchEvent } from '../../../(dashboard)/scorekeeper/scorekeeper.graphql';

export interface MatchPreviewVars {
  divisionId: string;
  matchId: string;
}

export interface MatchPreviewData {
  division: {
    id: string;
    field: {
      matches: Match[];
      loadedMatch: string | null;
    };
  };
}

export const GET_MATCH_PREVIEW_DATA: TypedDocumentNode<MatchPreviewData, MatchPreviewVars> = gql`
  query GetMatchPreviewData($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        matches {
          id
          slug
          stage
          round
          number
          scheduledTime
          startTime
          status
          participants {
            team {
              id
              name
              number
              affiliation
              city
              arrived
              logoUrl
            }
            table {
              id
              name
            }
            queued
            present
            ready
          }
        }
        loadedMatch
      }
    }
  }
`;

export function parseMatchPreviewData(data: MatchPreviewData) {
  const matches = data.division.field.matches;
  const loadedMatch = data.division.field.loadedMatch;
  return { matches, loadedMatch };
}

type SubscriptionVars = { divisionId: string; lastSeenVersion?: number };
type MatchLoadedSubscriptionData = { matchLoaded: MatchEvent };

export const MATCH_LOADED_SUBSCRIPTION: TypedDocumentNode<
  MatchLoadedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchLoaded($divisionId: String!, $lastSeenVersion: Int) {
    matchLoaded(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      matchId
      version
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
    updateQuery: (prev: MatchPreviewData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      return merge(prev, {
        division: {
          field: {
            loadedMatch: (data as MatchLoadedSubscriptionData).matchLoaded.matchId
          }
        }
      });
    }
  };
}
