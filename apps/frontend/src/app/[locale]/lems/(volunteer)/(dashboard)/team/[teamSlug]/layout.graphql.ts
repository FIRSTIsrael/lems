import { gql, type TypedDocumentNode } from '@apollo/client';

type GetTeamDataQuery = {
  division: {
    id: string;
    teams: Array<{
      id: string;
      name: string;
      number: number;
      affiliation: string;
      city: string;
      logoUrl: string;
      slug: string;
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
        teams(slugs: [$teamSlug]) {
          id
          name
          number
          affiliation
          city
          logoUrl
          slug
          arrived
        }
      }
    }
  `;
