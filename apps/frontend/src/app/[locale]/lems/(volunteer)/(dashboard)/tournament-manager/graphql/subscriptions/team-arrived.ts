import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateInArray } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { SubscriptionVars, QueryData } from '../types';

interface SubscriptionData {
  teamArrived: {
    teamId: string;
  };
}

export const TEAM_ARRIVED_SUBSCRIPTION: TypedDocumentNode<SubscriptionData, SubscriptionVars> = gql`
  subscription TeamArrived($divisionId: String!) {
    teamArrivalUpdated(divisionId: $divisionId) {
      teamId
    }
  }
`;

export function createTeamArrivedSubscription(
  divisionId: string,
  onTeamArrived?: (event: SubscriptionData['teamArrived']) => void
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  const updateQuery = (prev: QueryData, { data }: { data?: unknown }) => {
    if (!data) return prev;

    const { teamId } = (data as SubscriptionData).teamArrived;

    if (!prev.division) {
      return prev;
    }

    // Update root teams array
    const updatedTeams = updateInArray(
      prev.division.teams,
      team => team.id === teamId,
      team => ({ ...team, arrived: true })
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
                  team: { ...participant.team, arrived: true }
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
              team: { ...session.team, arrived: true }
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

  const baseConfig: SubscriptionConfig<unknown, QueryData, SubscriptionVars> = {
    subscription: TEAM_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery
  };

  if (onTeamArrived) {
    const originalUpdateQuery = baseConfig.updateQuery;
    baseConfig.updateQuery = (prev: QueryData, subscriptionData: { data?: unknown }) => {
      if (subscriptionData.data) {
        onTeamArrived((subscriptionData.data as SubscriptionData).teamArrived);
      }
      return originalUpdateQuery(prev, subscriptionData);
    };
  }

  return baseConfig;
}
