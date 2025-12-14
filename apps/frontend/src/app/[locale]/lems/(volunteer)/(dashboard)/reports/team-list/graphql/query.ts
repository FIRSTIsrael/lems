import { gql, type TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars } from './types';

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

export function parseDivisionTeams(queryData: QueryData) {
  return queryData.division?.teams || [];
}

export type { QueryData, QueryVars };
