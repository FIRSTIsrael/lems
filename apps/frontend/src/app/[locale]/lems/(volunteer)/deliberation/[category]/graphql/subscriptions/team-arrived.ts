import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { CategoryDeliberationData } from '../types';

export const TEAM_ARRIVAL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  {
    teamArrivalUpdated: {
      teamId: string;
    };
  },
  {
    divisionId: string;
  }
> = gql`
  subscription TeamArrivalUpdated($divisionId: String!) {
    teamArrivalUpdated(divisionId: $divisionId) {
      teamId
    }
  }
`;

export const TEAM_NOT_ARRIVED_SUBSCRIPTION: TypedDocumentNode<
  {
    teamNotArrived: {
      teamId: string;
    };
  },
  {
    divisionId: string;
  }
> = gql`
  subscription TeamNotArrived($divisionId: String!) {
    teamNotArrived(divisionId: $divisionId) {
      teamId
    }
  }
`;

const setTeamArrived = (
  prev: CategoryDeliberationData,
  teamId: string,
  arrived: boolean
): CategoryDeliberationData => {
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

const teamArrivalUpdatedReconciler: Reconciler<
  CategoryDeliberationData,
  { teamArrivalUpdated: { teamId: string } }
> = (prev, { data }) => {
  if (!data?.teamArrivalUpdated) return prev;
  return setTeamArrived(prev, data.teamArrivalUpdated.teamId, true);
};

const teamNotArrivedReconciler: Reconciler<
  CategoryDeliberationData,
  { teamNotArrived: { teamId: string } }
> = (prev, { data }) => {
  if (!data?.teamNotArrived) return prev;
  return setTeamArrived(prev, data.teamNotArrived.teamId, false);
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

export function createTeamNotArrivedSubscription(divisionId: string) {
  return {
    subscription: TEAM_NOT_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: teamNotArrivedReconciler as (
      prev: CategoryDeliberationData,
      subscriptionData: { data?: unknown }
    ) => CategoryDeliberationData
  };
}
