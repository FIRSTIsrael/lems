import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { CategoryDeliberationData } from '../types';

interface TeamArrivalEvent {
  teamId: string;
  arrived: boolean;
}

export const TEAM_ARRIVAL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  {
    teamArrivalUpdated: TeamArrivalEvent;
  },
  {
    divisionId: string;
  }
> = gql`
  subscription TeamArrivalUpdated($divisionId: String!) {
    teamArrivalUpdated(divisionId: $divisionId) {
      teamId
      arrived
    }
  }
`;

const teamArrivalUpdatedReconciler: Reconciler<
  CategoryDeliberationData,
  { teamArrivalUpdated: TeamArrivalEvent }
> = (prev, { data }) => {
  if (!data?.teamArrivalUpdated) return prev;

  const { teamId, arrived } = data.teamArrivalUpdated;
  const teamIndex = prev.division.teams.findIndex(t => t.id === teamId);

  if (teamIndex === -1) return prev;

  return merge(prev, {
    division: {
      teams: [
        ...prev.division.teams.slice(0, teamIndex),
        {
          ...prev.division.teams[teamIndex],
          arrived
        },
        ...prev.division.teams.slice(teamIndex + 1)
      ]
    }
  });
};

export function createTeamArrivalUpdatedSubscription(divisionId: string) {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: teamArrivalUpdatedReconciler as (
      prev: CategoryDeliberationData,
      subscriptionData: { data?: unknown }
    ) => CategoryDeliberationData
  };
}
