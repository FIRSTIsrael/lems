import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';

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
  startTime?: string;
  startDelta?: number;
}

export interface MatchStageAdvancedEvent {
  version: number;
}

export interface MatchCompletedEvent {
  matchId: string;
  version: number;
}

type SubscriptionVars = { divisionId: string; lastSeenVersion?: number };
type MatchLoadedSubscriptionData = { matchLoaded: MatchEvent };
type MatchStartedSubscriptionData = { matchStarted: MatchEvent };
type MatchStageAdvancedSubscriptionData = { matchStageAdvanced: MatchStageAdvancedEvent };
type MatchCompletedSubscriptionData = { matchCompleted: MatchCompletedEvent };

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

export const MATCH_STARTED_SUBSCRIPTION: TypedDocumentNode<
  MatchStartedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchStarted($divisionId: String!, $lastSeenVersion: Int) {
    matchStarted(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      matchId
      startTime
      startDelta
      version
    }
  }
`;

export const MATCH_STAGE_ADVANCED_SUBSCRIPTION: TypedDocumentNode<
  MatchStageAdvancedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchStageAdvanced($divisionId: String!, $lastSeenVersion: Int) {
    matchStageAdvanced(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      version
    }
  }
`;

export const MATCH_COMPLETED_SUBSCRIPTION: TypedDocumentNode<
  MatchCompletedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchCompleted($divisionId: String!, $lastSeenVersion: Int) {
    matchCompleted(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      matchId
      version
    }
  }
`;

type LoadMatchMutationData = { loadMatch: MatchEvent };
type LoadMatchMutationVars = { divisionId: string; matchId: string };

type StartMatchMutationData = { startMatch: MatchEvent };
type StartMatchMutationVars = { divisionId: string; matchId: string };

export const LOAD_MATCH_MUTATION: TypedDocumentNode<LoadMatchMutationData, LoadMatchMutationVars> =
  gql`
    mutation LoadMatch($divisionId: String!, $matchId: String!) {
      loadMatch(divisionId: $divisionId, matchId: $matchId) {
        matchId
        version
      }
    }
  `;

export const START_MATCH_MUTATION: TypedDocumentNode<
  StartMatchMutationData,
  StartMatchMutationVars
> = gql`
  mutation StartMatch($divisionId: String!, $matchId: String!) {
    startMatch(divisionId: $divisionId, matchId: $matchId) {
      matchId
      startTime
      startDelta
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
  };
}

/**
 * Creates a subscription configuration for match started events in the scorekeeper view.
 * When a match starts, updates the activeMatch field in the field data.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchStartedSubscription(divisionId: string) {
  return {
    subscription: MATCH_STARTED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ScorekeeperData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      return merge(prev, {
        division: {
          field: {
            activeMatch: (data as MatchStartedSubscriptionData).matchStarted.matchId
          }
        }
      });
    }
  };
}

/**
 * Creates a subscription configuration for match stage advanced events in the scorekeeper view.
 * When the stage advances, updates the currentStage field in the field data.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchStageAdvancedSubscription(divisionId: string) {
  return {
    subscription: MATCH_STAGE_ADVANCED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ScorekeeperData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      return merge(prev, {
        division: {
          field: {
            currentStage: 'RANKING' as MatchStage
          }
        }
      });
    }
  };
}

/**
 * Creates a subscription configuration for match completed events in the scorekeeper view.
 * When a match completes, updates its status in the matches list.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchCompletedSubscription(divisionId: string) {
  return {
    subscription: MATCH_COMPLETED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ScorekeeperData, { data }: { data?: unknown }) => {
      if (!prev.division?.field?.matches || !data) return prev;
      const completedMatchId = (data as MatchCompletedSubscriptionData).matchCompleted.matchId;
      return merge(prev, {
        division: {
          field: {
            matches: prev.division.field.matches.map(match =>
              match.id === completedMatchId
                ? { ...match, status: 'completed' as MatchStatus }
                : match
            )
          }
        }
      });
    }
  };
}
