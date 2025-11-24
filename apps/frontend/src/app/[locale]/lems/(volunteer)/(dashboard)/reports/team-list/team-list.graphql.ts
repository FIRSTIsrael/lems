import { gql, TypedDocumentNode } from '@apollo/client';
import { merge, updateById, Reconciler } from '@lems/shared/utils';
import type { SubscriptionConfig } from '../../../hooks/use-page-data';

export interface Team {
  id: string;
  number: number;
  name: string;
  affiliation: string;
  city: string;
  region: string;
  arrived: boolean;
}

export interface TeamEvent {
  teamId: string;
  version: number;
}

type QueryData = { division?: { id: string; teams: Team[] } | null };
type QueryVars = { divisionId: string };

type SubscriptionData = { teamArrivalUpdated: TeamEvent };
type SubscriptionVars = QueryVars & { lastSeenVersion?: number };

export const GET_DIVISION_TEAMS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetDivisionTeams($divisionId: String!) {
    division(id: $divisionId) {
      id
      teams {
        id
        number
        name
        affiliation
        city
        arrived
        region
      }
    }
  }
`;

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

/**
 * Parses the query result to extract teams array.
 *
 * @param queryData - The query result from GetDivisionTeams
 * @returns Array of teams or empty array
 */
export function parseDivisionTeams(queryData: QueryData): Team[] {
  return queryData.division?.teams || [];
}

/**
 * Reconciler for team arrival/registration updates.
 * Updates the arrived status of a team in the division's teams array.
 */
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

/**
 * Creates a subscription configuration for team arrival updates.
 * When a team arrives, the subscription returns minimal data (teamId + version).
 * The reconciler locates the team in the cached query result and marks it as arrived.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createTeamRegistrationSubscription(
  divisionId: string
): SubscriptionConfig<SubscriptionData, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: teamRegistrationReconciler
  };
}
