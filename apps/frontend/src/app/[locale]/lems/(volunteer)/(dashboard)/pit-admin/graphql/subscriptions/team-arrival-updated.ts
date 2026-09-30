import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateById } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { TeamEvent } from '../types';
import type { QueryData } from '../query';

interface SubscriptionData {
  teamArrivalUpdated: TeamEvent;
}

interface NotArrivedSubscriptionData {
  teamNotArrived: TeamEvent;
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

export function createTeamArrivalSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) =>
      data ? setTeamArrived(prev, (data as SubscriptionData).teamArrivalUpdated.teamId, true) : prev
  };
}

export function createTeamNotArrivedSubscription(
  divisionId: string
): SubscriptionConfig<unknown, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_NOT_ARRIVED_SUBSCRIPTION,
    subscriptionVariables: { divisionId },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) =>
      data
        ? setTeamArrived(prev, (data as NotArrivedSubscriptionData).teamNotArrived.teamId, false)
        : prev
  };
}
