import { gql, TypedDocumentNode } from '@apollo/client';

export interface PitMapData {
  division?: {
    id: string;
    pitMapUrl: string | null;
  } | null;
}

export interface PitMapVars {
  divisionId: string;
}

export const GET_DIVISION_PIT_MAP: TypedDocumentNode<PitMapData, PitMapVars> = gql`
  query GetDivisionPitMap($divisionId: String!) {
    division(id: $divisionId) {
      id
      pitMapUrl
    }
  }
`;

export function parsePitMapUrl(data: PitMapData): string | null {
  return data.division?.pitMapUrl ?? null;
}
