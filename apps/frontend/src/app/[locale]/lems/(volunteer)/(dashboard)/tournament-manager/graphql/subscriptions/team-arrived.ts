import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { SubscriptionVars, QueryData } from '../types';

interface TeamEvent {
  teamId: string;
}

interface SubscriptionData {
  teamArrivalUpdated: TeamEvent;
}

interface NotArrivedSubscriptionData {
  teamNotArrived: TeamEvent;
}

export const TEAM_ARRIVED_SUBSCRIPTION: TypedDocumentNode<SubscriptionData, SubscriptionVars> = gql`
  subscription TeamArrived($divisionId: String!) {
    teamArrivalUpdated(divisionId: $divisionId) {
      teamId
    }
  }
`;

export const TEAM_NOT_ARRIVED_SUBSCRIPTION: TypedDocumentNode<
  NotArrivedSubscriptionData,
  SubscriptionVars
> = gql`
  subscription TeamNotArrived($divisionId: String!) {
    teamNotArrived(divisionId: $divisionId) {
      teamId
    }
  }
`;

const setTeamArrived = (prev: QueryData, teamId: string, arrived: boolean): QueryData => {
  if (!prev.division) {
    return prev;
  }

  // Update root teams array
  const updatedTeams = updateInArray(
    prev.division.teams,
    team => team.id === teamId,
    team => ({ ...team, arrived })
  );

  // Update match participants' teams
  const updatedMatches = updateInArray(
    prev.division.field.matches,
    () => true,
    match => ({
      ...match,
      participants: updateInArray(
        match.participants,
        () => true,
        participant =>
          participant.team?.id === teamId
            ? {
                ...participant,
                team: { ...participant.team, arrived }
              }
            : participant
      )
    })
  );

  // Update judging session teams
  const updatedSessions = updateInArray(
    prev.division.judging.sessions,
    () => true,
    session =>
      session.team?.id === teamId
        ? {
            ...session,
            team: { ...session.team, arrived }
          }
        : session
  );

  return merge(prev, {
    division: {
      id: prev.division.id,
      name: prev.division.name,
      teams: updatedTeams,
      tables: prev.division.tables,
      rooms: prev.division.rooms,
      field: {
        divisionId: prev.division.field.divisionId,
        matches: updatedMatches,
        loadedMatch: prev.division.field.loadedMatch,
        activeMatch: prev.division.field.activeMatch
      },
      judging: {
        divisionId: prev.division.judging.divisionId,
        sessionLength: prev.division.judging.sessionLength,
        sessions: updatedSessions
      }
    }
  });
};

export function createTeamArrivedSubscription(
  divisionId: string,
  onTeamArrived?: (event: TeamEvent) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) => {
      if (!data) return prev;
      const event = (data as SubscriptionData).teamArrivalUpdated;
      onTeamArrived?.(event);
      return setTeamArrived(prev, event.teamId, true);
    }
  };
}

export function createTeamNotArrivedSubscription(
  divisionId: string,
  onTeamNotArrived?: (event: TeamEvent) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_NOT_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) => {
      if (!data) return prev;
      const event = (data as NotArrivedSubscriptionData).teamNotArrived;
      onTeamNotArrived?.(event);
      return setTeamArrived(prev, event.teamId, false);
    }
  };
}
