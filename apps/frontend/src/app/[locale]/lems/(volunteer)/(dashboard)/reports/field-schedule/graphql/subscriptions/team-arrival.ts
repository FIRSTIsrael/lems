import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { QueryData } from '../types';

interface SubscriptionVars {
  divisionId: string;
}

interface SubscriptionData {
  teamArrivalUpdated: {
    teamId: string;
    arrived: boolean;
  };
}

export const TEAM_ARRIVED_SUBSCRIPTION: TypedDocumentNode<SubscriptionData, SubscriptionVars> = gql`
  subscription TeamArrived($divisionId: String!) {
    teamArrivalUpdated(divisionId: $divisionId) {
      teamId
    }
  }
`;

const teamArrivedReconciler: Reconciler<QueryData, SubscriptionData> = (prev, { data }) => {
  if (!data) return prev;

  const { teamId, arrived } = data.teamArrivalUpdated;

  return merge(prev, {
    division: {
      teams: prev.division.teams.map(team => (team.id === teamId ? merge(team, { arrived }) : team))
    }
  });
};

export function createTeamArrivedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: teamArrivedReconciler as (
      prev: QueryData,
      subscriptionData: { data?: unknown }
    ) => QueryData
  };
}
