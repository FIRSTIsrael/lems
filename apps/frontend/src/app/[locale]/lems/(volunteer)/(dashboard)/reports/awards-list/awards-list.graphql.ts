import { gql, TypedDocumentNode } from '@apollo/client';

export interface Award {
  id: string;
  name: string;
  place: number;
  description: string | null;
}

interface QueryData {
  division?: {
    id: string;
    awards: Award[];
  } | null;
}

interface QueryVars {
  divisionId: string;
}

export const GET_DIVISION_AWARDS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetDivisionAwards($divisionId: String!) {
    division(id: $divisionId) {
      id
      awards {
        id
        name
        place
        description
      }
    }
  }
`;

export function parseDivisionAwards(data: QueryData): Award[] {
  return data.division?.awards ?? [];
}
