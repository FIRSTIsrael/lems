import { gql, TypedDocumentNode } from '@apollo/client';
import type { Team } from './types';

export interface QueryData {
  division?: { id: string; teams: Team[] } | null;
}

export interface QueryVars {
  divisionId: string;
}

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

export function parseDivisionTeams(queryData: QueryData): Team[] {
  return queryData.division?.teams || [];
}
