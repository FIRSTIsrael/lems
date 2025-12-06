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

export interface TeamEvent {
  teamId: string;
  version: number;
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
  autoLoadedMatchId?: string;
}

export interface MatchAbortedEvent {
  matchId: string;
  version: number;
}

type SubscriptionVars = { divisionId: string; lastSeenVersion?: number };
type TeamArrivalSubscriptionData = { teamArrivalUpdated: TeamEvent };
type MatchLoadedSubscriptionData = { matchLoaded: MatchEvent };
type MatchStartedSubscriptionData = { matchStarted: MatchEvent };
type MatchStageAdvancedSubscriptionData = { matchStageAdvanced: MatchStageAdvancedEvent };
type MatchCompletedSubscriptionData = { matchCompleted: MatchCompletedEvent };
type MatchAbortedSubscriptionData = { matchAborted: MatchAbortedEvent };

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
      autoLoadedMatchId
    }
  }
`;

export const MATCH_ABORTED_SUBSCRIPTION: TypedDocumentNode<
  MatchAbortedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription MatchAborted($divisionId: String!, $lastSeenVersion: Int) {
    matchAborted(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      matchId
      version
    }
  }
`;

export const TEAM_ARRIVAL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  TeamArrivalSubscriptionData,
  SubscriptionVars
> = gql`
  subscription TeamArrivalUpdated($divisionId: String!, $lastSeenVersion: Int) {
    teamArrivalUpdated(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      teamId
      version
    }
  }
`;

type LoadMatchMutationData = { loadMatch: MatchEvent };
type LoadMatchMutationVars = { divisionId: string; matchId: string };

type StartMatchMutationData = { startMatch: MatchEvent };
type StartMatchMutationVars = { divisionId: string; matchId: string };

type AbortMatchMutationData = { abortMatch: MatchAbortedEvent };
type AbortMatchMutationVars = { divisionId: string; matchId: string };

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

export const ABORT_MATCH_MUTATION: TypedDocumentNode<
  AbortMatchMutationData,
  AbortMatchMutationVars
> = gql`
  mutation AbortMatch($divisionId: String!, $matchId: String!) {
    abortMatch(divisionId: $divisionId, matchId: $matchId) {
      matchId
      version
    }
  }
`;

/**
 * Creates a subscription configuration for team arrival updated events in the scorekeeper view.
 * When a team's arrival status is updated, updates the corresponding team in all matches' participants list.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createTeamArrivalSubscription(divisionId: string) {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ScorekeeperData, { data }: { data?: unknown }) => {
      if (!prev.division?.field?.matches || !data) return prev;
      const teamArrivalUpdated = (data as TeamArrivalSubscriptionData).teamArrivalUpdated;

      return merge(prev, {
        division: {
          field: {
            matches: prev.division.field.matches.map(match => ({
              ...match,
              participants: match.participants.map(participant => {
                if (participant.team?.id === teamArrivalUpdated.teamId) {
                  return {
                    ...participant,
                    team: {
                      ...participant.team,
                      arrived: true
                    }
                  };
                }
                return participant;
              })
            }))
          }
        }
      });
    }
  };
}

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
      const match = (data as MatchStartedSubscriptionData).matchStarted;
      return merge(prev, {
        division: {
          field: {
            activeMatch: match.matchId,
            loadedMatch:
              match.matchId === prev.division.field.loadedMatch
                ? null
                : prev.division.field.loadedMatch,
            matches: prev.division.field.matches.map(m =>
              m.id === match.matchId
                ? {
                    ...m,
                    status: 'in-progress' as MatchStatus,
                    startTime: match.startTime,
                    startDelta: match.startDelta
                  }
                : m
            )
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
 * When a match completes, updates its status in the matches list and the loadedMatch if auto-loaded.
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
      const completedData = (data as MatchCompletedSubscriptionData).matchCompleted;
      const completedMatchId = completedData.matchId;

      const updates: Partial<ScorekeeperData['division']['field']> = {
        activeMatch: null,
        matches: prev.division.field.matches.map(match =>
          match.id === completedMatchId ? { ...match, status: 'completed' as MatchStatus } : match
        )
      };

      // Only update loadedMatch if autoLoadedMatchId was provided
      if (completedData.autoLoadedMatchId) {
        updates.loadedMatch = completedData.autoLoadedMatchId;
      }

      return merge(prev, {
        division: {
          field: updates
        }
      });
    }
  };
}

/**
 * Creates a subscription configuration for match aborted events in the scorekeeper view.
 * When a match is aborted, updates its status back to not-started in the matches list.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createMatchAbortedSubscription(divisionId: string) {
  return {
    subscription: MATCH_ABORTED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: ScorekeeperData, { data }: { data?: unknown }) => {
      if (!prev.division?.field?.matches || !data) return prev;
      const matchAborted = (data as MatchAbortedSubscriptionData).matchAborted;
      const match = prev.division.field.matches.find(m => m.id === matchAborted.matchId);
      if (!match) return prev;
      return merge(prev, {
        division: {
          field: {
            activeMatch: null,
            loadedMatch: match.stage === 'TEST' ? null : match.id,
            matches: prev.division.field.matches.map(m =>
              m.id === matchAborted.matchId
                ? {
                    ...m,
                    status: 'not-started' as MatchStatus,
                    startTime: null,
                    startDelta: null
                  }
                : m
            )
          }
        }
      });
    }
  };
}
