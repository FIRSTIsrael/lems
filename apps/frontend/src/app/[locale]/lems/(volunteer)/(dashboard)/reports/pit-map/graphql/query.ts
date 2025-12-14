import { gql, type TypedDocumentNode } from '@apollo/client';
import type { PitMapData, PitMapVars } from './types';

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

export type { PitMapData, PitMapVars };
