import { gql, TypedDocumentNode } from '@apollo/client';
import { merge } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../hooks/use-page-data';
import type {
  MatchCompletedEvent,
  MatchEvent,
  TeamArrivedEvent,
  RefereeData,
  RobotGameMatchStatus
} from './types';

interface SubscriptionVars {
  divisionId: string;
}

export const MATCH_STARTED_SUBSCRIPTION: TypedDocumentNode<
  { matchStarted: MatchEvent },
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

export const MATCH_COMPLETED_SUBSCRIPTION: TypedDocumentNode<
  { matchCompleted: MatchCompletedEvent },
  SubscriptionVars
> = gql`
  subscription MatchCompleted($divisionId: String!) {
    matchCompleted(divisionId: $divisionId) {
      matchId
    }
  }
`;

export const TEAM_ARRIVED_SUBSCRIPTION: TypedDocumentNode<
  { teamArrived: TeamArrivedEvent },
  SubscriptionVars
> = gql`
  subscription TeamArrived($divisionId: String!) {
    teamArrivalUpdated(divisionId: $divisionId) {
      teamId
    }
  }
`;

export const PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  { participantStatusUpdated: import('./types').ParticipantStatusUpdatedEvent },
  SubscriptionVars
> = gql`
  subscription ParticipantStatusUpdated($divisionId: String!) {
    participantStatusUpdated(divisionId: $divisionId) {
      participantId
      present
      ready
    }
  }
`;

export const MATCH_LOADED_SUBSCRIPTION: TypedDocumentNode<
  { matchLoaded: import('./types').MatchLoadedEvent },
  SubscriptionVars
> = gql`
  subscription MatchLoaded($divisionId: String!) {
    matchLoaded(divisionId: $divisionId) {
      matchId
    }
  }
`;

export const MATCH_ABORTED_SUBSCRIPTION: TypedDocumentNode<
  { matchAborted: import('./types').MatchAbortedEvent },
  SubscriptionVars
> = gql`
  subscription MatchAborted($divisionId: String!) {
    matchAborted(divisionId: $divisionId) {
      matchId
    }
  }
`;

export function createMatchStartedSubscription(divisionId: string) {
  return {
    subscription: MATCH_STARTED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const match = (data as { matchStarted: MatchEvent }).matchStarted;
      return merge(prev, {
        division: {
          field: {
            activeMatch: match.matchId,
            loadedMatch:
              match.matchId === prev.division.field.loadedMatch
                ? null
                : prev.division.field.loadedMatch,
            matches: prev.division.field.matches.map(_match =>
              _match.id === match.matchId
                ? {
                    ..._match,
                    status: 'in-progress' as RobotGameMatchStatus,
                    startTime: match.startTime
                  }
                : _match
            )
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}

export function createMatchCompletedSubscription(divisionId: string) {
  return {
    subscription: MATCH_COMPLETED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const match = (data as { matchCompleted: MatchCompletedEvent }).matchCompleted;
      return merge(prev, {
        division: {
          field: {
            matches: prev.division.field.matches.map(_match =>
              _match.id === match.matchId
                ? {
                    ..._match,
                    status: 'completed' as RobotGameMatchStatus
                  }
                : _match
            )
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}

export function createTeamArrivedSubscription(divisionId: string) {
  return {
    subscription: TEAM_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as { teamArrived: TeamArrivedEvent }).teamArrived;
      return merge(prev, {
        division: {
          field: {
            matches: prev.division.field.matches.map(_match =>
              _match.id === event.matchId
                ? {
                    ..._match,
                    participants: _match.participants.map(p =>
                      p.team?.id === event.teamId
                        ? { ...p, team: p.team ? { ...p.team, arrived: event.arrived } : null }
                        : p
                    )
                  }
                : _match
            )
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}

export function createParticipantStatusUpdatedSubscription(divisionId: string) {
  return {
    subscription: PARTICIPANT_STATUS_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (
        data as { participantStatusUpdated: import('./types').ParticipantStatusUpdatedEvent }
      ).participantStatusUpdated;
      return merge(prev, {
        division: {
          field: {
            matches: prev.division.field.matches.map(_match => ({
              ..._match,
              participants: _match.participants.map(p =>
                p.id === event.participantId
                  ? {
                      ...p,
                      present: !!event.present,
                      ready: !!event.ready
                    }
                  : p
              )
            }))
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}

export function createMatchLoadedSubscription(divisionId: string) {
  return {
    subscription: MATCH_LOADED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as { matchLoaded: import('./types').MatchLoadedEvent }).matchLoaded;
      return merge(prev, {
        division: {
          field: {
            loadedMatch: event.matchId
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}

export function createMatchAbortedSubscription(divisionId: string) {
  return {
    subscription: MATCH_ABORTED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: RefereeData, { data }: { data?: unknown }) => {
      if (!prev.division?.field || !data) return prev;
      const event = (data as { matchAborted: import('./types').MatchAbortedEvent }).matchAborted;
      const match = prev.division.field.matches.find(_match => _match.id === event.matchId);
      if (!match) return prev;
      return merge(prev, {
        division: {
          field: {
            activeMatch: null,
            loadedMatch: match.stage === 'TEST' ? null : match.id,
            matches: prev.division.field.matches.map(m =>
              m.id === event.matchId
                ? {
                    ...m,
                    status: 'not-started' as RobotGameMatchStatus,
                    startTime: null
                  }
                : m
            )
          }
        }
      });
    }
  } as SubscriptionConfig<unknown, RefereeData, SubscriptionVars>;
}
