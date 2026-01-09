import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { FinalDeliberationData } from '../types';

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

const teamArrivalUpdatedReconciler: Reconciler<
  FinalDeliberationData,
  { teamArrivalUpdated: { teamId: string } }
> = (prev, { data }) => {
  if (!data?.teamArrivalUpdated) return prev;

  const { teamId } = data.teamArrivalUpdated;
  const teamIndex = prev.division.teams.findIndex(t => t.id === teamId);

  if (teamIndex === -1) return prev;

  const team = prev.division.teams[teamIndex];

  return merge(prev, {
    division: {
      teams: [
        ...prev.division.teams.slice(0, teamIndex),
        {
          ...prev.division.teams[teamIndex],
          arrived: !team.arrived
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
      prev: FinalDeliberationData,
      subscriptionData: { data?: unknown }
    ) => FinalDeliberationData
  };
}
