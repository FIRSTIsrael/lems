import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, updateById, type Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { QueryData, SubscriptionData, SubscriptionVars } from '../types';

export const TEAM_ARRIVAL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionData,
  SubscriptionVars
> = gql`
  subscription TeamArrivalUpdated($divisionId: String!) {
    teamArrivalUpdated(divisionId: $divisionId) {
      teamId
    }
  }
`;

const teamRegistrationReconciler: Reconciler<QueryData, SubscriptionData> = (prev, { data }) => {
  if (!data) return prev;

  const { teamId } = data.teamArrivalUpdated;

  if (prev.division) {
    return merge(prev, {
      division: {
        id: prev.division.id,
        teams: updateById(prev.division.teams, teamId, team => merge(team, { arrived: true }))
      }
    });
  }

  return prev;
};

export function createTeamRegistrationSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: teamRegistrationReconciler as (
      prev: QueryData,
      subscriptionData: { data?: unknown }
    ) => QueryData
  };
}
