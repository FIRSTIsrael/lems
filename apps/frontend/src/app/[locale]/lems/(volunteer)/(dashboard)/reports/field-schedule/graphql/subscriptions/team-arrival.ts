import { gql, type TypedDocumentNode } from '@apollo/client';
import { merge, type Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../../hooks/use-page-data';
import type { QueryData } from '../types';

interface SubscriptionVars {
  divisionId: string;
}

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

const setTeamArrived = (prev: QueryData, teamId: string, arrived: boolean): QueryData =>
  merge(prev, {
    division: {
      teams: prev.division.teams.map(team => (team.id === teamId ? merge(team, { arrived }) : team))
    }
  });

const teamArrivedReconciler: Reconciler<QueryData, SubscriptionData> = (prev, { data }) =>
  data ? setTeamArrived(prev, data.teamArrivalUpdated.teamId, true) : prev;

const teamNotArrivedReconciler: Reconciler<QueryData, NotArrivedSubscriptionData> = (
  prev,
  { data }
) => (data ? setTeamArrived(prev, data.teamNotArrived.teamId, false) : prev);

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

export function createTeamNotArrivedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_NOT_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: teamNotArrivedReconciler as (
      prev: QueryData,
      subscriptionData: { data?: unknown }
    ) => QueryData
  };
}
