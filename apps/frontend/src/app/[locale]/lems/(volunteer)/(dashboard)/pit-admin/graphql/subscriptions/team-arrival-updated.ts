import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateById, Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { TeamArrivalEvent } from '../types';
import type { QueryData } from '../query';

interface SubscriptionData {
  teamArrivalUpdated: TeamArrivalEvent;
}

interface SubscriptionVars {
  divisionId: string;
}

export const TEAM_ARRIVAL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionData,
  SubscriptionVars
> = gql`
  subscription TeamArrivalUpdated($divisionId: String!) {
    teamArrivalUpdated(divisionId: $divisionId) {
      teamId
      arrived
    }
  }
`;

const teamArrivalReconciler: Reconciler<QueryData, SubscriptionData> = (prev, { data }) => {
  if (!data) return prev;

  const { teamId, arrived } = data.teamArrivalUpdated;

  if (prev.division) {
    return merge(prev, {
      division: {
        id: prev.division.id,
        teams: updateById(prev.division.teams, teamId, team => merge(team, { arrived }))
      }
    });
  }

  return prev;
};

export function createTeamArrivalSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: teamArrivalReconciler
  } as SubscriptionConfig<unknown, QueryData, SubscriptionVars>;
}
