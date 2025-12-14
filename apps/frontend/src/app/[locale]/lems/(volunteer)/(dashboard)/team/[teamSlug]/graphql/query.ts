import { gql, type TypedDocumentNode } from '@apollo/client';
import type { GetTeamDataQuery, GetTeamDataQueryVariables } from './types';

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
