/**
 * GraphQL queries and subscriptions for team arrival
 */

export const TEAM_ARRIVAL_QUERY = `
  query GetDivisionTeams($divisionId: String!) {
    division(id: $divisionId) {
      teams {
        id
        number
        name
        arrived
      }
    }
  }
`;

export const TEAM_ARRIVAL_SUBSCRIPTION = `
  subscription TeamArrivalUpdated {
    teamArrivalUpdated {
      teamId
      divisionId
      arrived
      updatedAt
    }
  }
`;

export const UPDATE_TEAM_ARRIVAL_MUTATION = `
  mutation UpdateTeamArrival($teamId: String!, $arrived: Boolean!, $divisionId: String!) {
    updateTeamArrival(teamId: $teamId, arrived: $arrived, divisionId: $divisionId) {
      teamId
      divisionId
      arrived
      updatedAt
    }
  }
`;
