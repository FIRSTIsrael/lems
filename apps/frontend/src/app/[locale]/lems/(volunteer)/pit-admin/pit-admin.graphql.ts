import { gql, TypedDocumentNode } from '@apollo/client';
import type { SubscriptionConfig } from '../hooks/use-page-data';

export interface Team {
  id: string;
  number: string;
  name: string;
  affiliation: string;
  city: string;
  arrived: boolean;
}

type QueryData = { division?: { id: string; teams: Team[] } | null };
type QueryVars = { divisionId: string };

type SubscriptionData = { teamArrivalUpdated: Team };
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
  { teamArrived: Team },
  QueryVars & { teamId: string }
> = gql`
  mutation TeamArrived($teamId: String!, $divisionId: String!) {
    teamArrived(teamId: $teamId, divisionId: $divisionId) {
      id
    }
  }
`;

export const TEAM_ARRIVAL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  SubscriptionData,
  SubscriptionVars
> = gql`
  subscription TeamArrivalUpdated($divisionId: String!, $lastSeenVersion: Int) {
    teamArrivalUpdated(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      id
      number
      name
      affiliation
      city
      arrived
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
 *
 * @param divisionId - The division ID to subscribe to
 * @param teamsMapRef - Ref to the teams map for reconciliation
 * @returns Subscription configuration for use with usePageData hook
 */
export function createTeamArrivalSubscription(
  divisionId: string,
  teamsMapRef: React.RefObject<Map<string, Team>>
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

      const subscriptionData = data as { teamArrivalUpdated: Team };
      const updatedTeam = subscriptionData.teamArrivalUpdated;

      teamsMapRef.current.set(updatedTeam.id, updatedTeam);

      if (prev.division) {
        return {
          ...prev,
          division: {
            ...prev.division,
            teams: Array.from(teamsMapRef.current.values())
          }
        };
      }

      return prev;
    }
  };
}
