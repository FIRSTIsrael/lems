import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, Reconciler } from '@lems/shared/utils';

export type MatchStage = 'PRACTICE' | 'RANKING' | 'TEST';
export type MatchStatus = 'not-started' | 'in-progress' | 'completed';

export interface MatchParticipant {
  team: {
    id: string;
    name: string;
    number: number;
    affiliation: string;
    city: string;
    arrived: boolean;
  } | null;
  table: {
    id: string;
    name: string;
  };
  queued: boolean;
  present: boolean;
  ready: boolean;
}

export interface Match {
  id: string;
  slug: string;
  stage: MatchStage;
  round: number;
  number: number;
  scheduledTime: string;
  startTime: string | null;
  status: MatchStatus;
  participants: MatchParticipant[];
}

export interface ScorekeeperData {
  division: {
    id: string;
    field: {
      matches: Match[];
      currentStage: MatchStage;
      loadedMatch: string | null;
      activeMatch: string | null;
      matchLength: number;
    };
  };
}

export interface ScorekeeperVars {
  divisionId: string;
}

export const GET_SCOREKEEPER_DATA: TypedDocumentNode<ScorekeeperData, ScorekeeperVars> = gql`
  query GetScorekeeperData($divisionId: String!) {
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
        currentStage
        loadedMatch
        activeMatch
        matchLength
      }
    }
  }
`;

export function parseScorekeeperData(data: ScorekeeperData) {
  return data.division.field;
}

export interface MatchEvent {
  matchId: string;
  version: number;
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

type LoadMatchMutationData = { loadMatch: MatchEvent };
type LoadMatchMutationVars = { divisionId: string; matchId: string };

export const LOAD_MATCH_MUTATION: TypedDocumentNode<LoadMatchMutationData, LoadMatchMutationVars> =
  gql`
    mutation LoadMatch($divisionId: String!, $matchId: String!) {
      loadMatch(divisionId: $divisionId, matchId: $matchId) {
        matchId
        version
      }
    }
  `;

/**
 * Reconciler for match loaded events in the scorekeeper view.
 * Updates the loadedMatch field when a match is loaded.
 */
const matchLoadedReconciler: Reconciler<ScorekeeperData, MatchLoadedSubscriptionData> = (
  prev,
  { data }
) => {
  if (!prev.division?.field || !data) return prev;

  const { matchId } = data.matchLoaded;

  return merge(prev, {
    division: {
      id: prev.division.id,
      field: {
        matches: prev.division.field.matches,
        currentStage: prev.division.field.currentStage,
        loadedMatch: matchId,
        activeMatch: prev.division.field.activeMatch,
        matchLength: prev.division.field.matchLength
      }
    }
  });
};

/**
 * Creates a subscription configuration for match loaded events in the scorekeeper view.
 * When a match is loaded, updates the loadedMatch field in the field data.
 *
 * @param divisionId - The division ID to subscribe to
 * @param onMatchLoaded - Optional callback invoked when a match is loaded
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchLoadedSubscription(
  divisionId: string,
  onMatchLoaded?: (event: MatchEvent) => void
) {
  const subscription = MATCH_LOADED_SUBSCRIPTION;
  const subscriptionVariables: SubscriptionVars = { divisionId };

  const baseConfig = {
    subscription,
    subscriptionVariables,
    updateQuery: matchLoadedReconciler as (
      prev: ScorekeeperData,
      subscriptionData: { data?: unknown }
    ) => ScorekeeperData
  };

  if (onMatchLoaded) {
    const originalUpdateQuery = baseConfig.updateQuery;
    baseConfig.updateQuery = (prev: ScorekeeperData, subscriptionData: { data?: unknown }) => {
      if (subscriptionData.data) {
        onMatchLoaded((subscriptionData.data as MatchLoadedSubscriptionData).matchLoaded);
      }
      return originalUpdateQuery(prev, subscriptionData);
    };
  }

  return baseConfig;
}
