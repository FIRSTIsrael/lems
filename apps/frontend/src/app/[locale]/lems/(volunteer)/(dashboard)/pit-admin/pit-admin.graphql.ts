import { gql, TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../../hooks/use-page-data';

export interface Team {
  id: string;
  number: string;
  name: string;
  affiliation: string;
  city: string;
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
      }
    }
  }
`;

export const TEAM_ARRIVED_MUTATION: TypedDocumentNode<
  { teamArrived: TeamEvent },
  QueryVars & { teamId: string }
> = gql`
  mutation TeamArrived($teamId: String!, $divisionId: String!) {
    teamArrived(teamId: $teamId, divisionId: $divisionId) {
      teamId
      version
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
 * Creates a subscription configuration for team arrival updates.
 * When a team arrives, the subscription returns minimal data (teamId + version).
 * The reconciler locates the team in the cached query result and marks it as arrived.
 *
 * @param divisionId - The division ID to subscribe to
 * @returns Subscription configuration for use with usePageData hook
 */
export function createTeamArrivalSubscription(
  divisionId: string
): SubscriptionConfig<SubscriptionData, QueryData, SubscriptionVars> {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }): QueryData => {
      if (!data || typeof data !== 'object' || !('teamArrivalUpdated' in data)) {
        return prev;
      }

      const subscriptionData = data as { teamArrivalUpdated: TeamEvent };
      const { teamId } = subscriptionData.teamArrivalUpdated;

      if (prev.division) {
        return {
          ...prev,
          division: {
            ...prev.division,
            teams: prev.division.teams.map(team =>
              team.id === teamId ? { ...team, arrived: true } : team
            )
          }
        };
      }

      return prev;
    }
  };
}
