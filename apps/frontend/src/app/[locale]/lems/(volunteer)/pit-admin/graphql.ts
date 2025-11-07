import { gql, TypedDocumentNode } from '@apollo/client';

/**
 * GraphQL operations for Pit Admin page
 */

// Types matching the GraphQL schema
export interface Team {
  id: string;
  number: string;
  name: string;
  affiliation: string;
  city: string;
  arrived: boolean;
}

export interface Division {
  id: string;
  teams: Team[];
}

// Query to fetch all teams in a division
export interface GetDivisionTeamsQuery {
  division: Division | null;
}

export interface GetDivisionTeamsQueryVariables {
  divisionId: string;
}

export const GET_DIVISION_TEAMS: TypedDocumentNode<
  GetDivisionTeamsQuery,
  GetDivisionTeamsQueryVariables
> = gql`
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

// Mutation to mark a team as arrived
export interface TeamArrivedMutation {
  teamArrived: Team;
}

export interface TeamArrivedMutationVariables {
  teamId: string;
  divisionId: string;
}

export const TEAM_ARRIVED_MUTATION: TypedDocumentNode<
  TeamArrivedMutation,
  TeamArrivedMutationVariables
> = gql`
  mutation TeamArrived($teamId: String!, $divisionId: String!) {
    teamArrived(teamId: $teamId, divisionId: $divisionId)
  }
`;

// Subscription for team arrival updates with message recovery support
export interface TeamArrivalUpdatedSubscription {
  teamArrivalUpdated: Team;
}

export interface TeamArrivalUpdatedSubscriptionVariables {
  divisionId: string;
  lastSeenVersion?: number;
}

export const TEAM_ARRIVAL_UPDATED_SUBSCRIPTION: TypedDocumentNode<
  TeamArrivalUpdatedSubscription,
  TeamArrivalUpdatedSubscriptionVariables
> = gql`
  subscription TeamArrivalUpdated($divisionId: String!, $lastSeenVersion: Int) {
    teamArrivalUpdated(divisionId: $divisionId, lastSeenVersion: $lastSeenVersion) {
      id
    }
  }
`;
