import { gql, TypedDocumentNode } from '@apollo/client';

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
  { teamArrivalUpdated: Team },
  QueryVars & { lastSeenVersion?: number }
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
 * Creates a subscription configuration for team arrival updates with recovery support.
 *
 * @param divisionId - The division ID to subscribe to
 * @param teamsMapRef - Ref to the teams map for reconciliation
 * @returns Subscription configuration for use with usePageData hook
 */
export function createTeamArrivalSubscription(
  divisionId: string,
  teamsMapRef: React.RefObject<Map<string, Team>>
) {
  return {
    subscription: TEAM_ARRIVAL_UPDATED_SUBSCRIPTION,
    subscriptionVariables: {
      divisionId
    },
    updateQuery: (prev: QueryData, { data }: { data?: unknown }) => {
      if (!data || typeof data !== 'object' || !('teamArrivalUpdated' in data)) {
        return prev;
      }

      const subscriptionData = data as { teamArrivalUpdated: Team };
      const updatedTeam = subscriptionData.teamArrivalUpdated;

      if (typeof updatedTeam === 'object' && updatedTeam !== null && '_gap' in updatedTeam) {
        console.warn('[PitAdmin] Recovery gap detected - query will refetch automatically');
        // Return unchanged to let the subscription trigger a refetch
        return prev;
      }

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
