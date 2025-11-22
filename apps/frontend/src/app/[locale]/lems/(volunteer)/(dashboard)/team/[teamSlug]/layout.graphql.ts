import { gql, type TypedDocumentNode } from '@apollo/client';

type GetTeamDataQuery = {
  division: {
    id: string;
    name: string;
    teams: Array<{
      id: string;
      slug: string;
      number: string;
      name: string;
      arrived: boolean;
    }>;
  } | null;
};

type GetTeamDataQueryVariables = {
  divisionId: string;
  teamSlug: string;
};

export const GET_TEAM_DATA_QUERY: TypedDocumentNode<GetTeamDataQuery, GetTeamDataQueryVariables> =
  gql`
    query GetTeamData($divisionId: String!, $teamSlug: String!) {
      division(id: $divisionId) {
        id
        name
        teams(slugs: [$teamSlug]) {
          id
          slug
          arrived
        }
      }
    }
  `;
