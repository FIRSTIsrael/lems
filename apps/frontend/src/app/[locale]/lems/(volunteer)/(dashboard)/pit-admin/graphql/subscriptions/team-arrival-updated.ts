import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateById, Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../../hooks/use-page-data';
import type { TeamEvent } from '../types';
import type { QueryData } from '../query';

interface SubscriptionData {
  teamArrivalUpdated: TeamEvent;
}

interface SubscriptionVars {
  divisionId: string;
  lastSeenVersion?: number;
}

export const TEAM_ARRIVAL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionData,
  SubscriptionVars
> = gql`
  subscription TeamArrivalUpdated($divisionId: String!, $lastSeenVersion: Int) {
    teamArrivalUpdated(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      teamId
      version
    }
  }
`;

const teamArrivalReconciler: Reconciler<QueryData, SubscriptionData> = (prev, { data }) => {
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
