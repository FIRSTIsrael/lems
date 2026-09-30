import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, updateById, type Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type {
  QueryData,
  SubscriptionData,
  NotArrivedSubscriptionData,
  SubscriptionVars
} from '../types';

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
  if (!prev.division) return prev;

  return merge(prev, {
    division: {
      id: prev.division.id,
      teams: updateById(prev.division.teams, teamId, team => merge(team, { arrived }))
    }
  });
};

const teamRegistrationReconciler: Reconciler<QueryData, SubscriptionData> = (prev, { data }) =>
  data ? setTeamArrived(prev, data.teamArrivalUpdated.teamId, true) : prev;

const teamNotArrivedReconciler: Reconciler<QueryData, NotArrivedSubscriptionData> = (
  prev,
  { data }
) => (data ? setTeamArrived(prev, data.teamNotArrived.teamId, false) : prev);

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

export function createTeamNotArrivedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_NOT_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: teamNotArrivedReconciler as (
      prev: QueryData,
      subscriptionData: { data?: unknown }
    ) => QueryData
  };
}
