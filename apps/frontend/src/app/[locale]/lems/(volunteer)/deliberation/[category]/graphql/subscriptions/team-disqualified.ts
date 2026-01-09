import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { CategoryDeliberationData } from '../types';

export const TEAM_DISQUALIFIED_SUBSCRIPTION: TypedDocumentNode<
  {
    teamDisqualified: {
      teamId: string;
    };
  },
  { divisionId: string }
> = gql`
  subscription TeamDisqualified($divisionId: String!) {
    teamDisqualified(divisionId: $divisionId) {
      teamId
    }
  }
`;

const teamDisqualifiedReconciler: Reconciler<
  CategoryDeliberationData,
  { teamDisqualified: { teamId: string } }
> = (prev, { data }) => {
  if (!data?.teamDisqualified) return prev;

  const { teamId } = data.teamDisqualified;
  const teamIndex = prev.division.teams.findIndex(t => t.id === teamId);

  if (teamIndex === -1) return prev;

  return merge(prev, {
    division: {
      teams: [
        ...prev.division.teams.slice(0, teamIndex),
        {
          ...prev.division.teams[teamIndex],
          disqualified: true
        },
        ...prev.division.teams.slice(teamIndex + 1)
      ]
    }
  });
};

export function createTeamDisqualifiedSubscription(divisionId: string) {
  return {
    subscription: TEAM_DISQUALIFIED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: teamDisqualifiedReconciler as (
      prev: CategoryDeliberationData,
      subscriptionData: { data?: unknown }
    ) => CategoryDeliberationData
  };
}
