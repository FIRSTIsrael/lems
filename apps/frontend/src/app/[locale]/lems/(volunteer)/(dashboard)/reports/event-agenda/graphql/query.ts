import { gql, TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars, AgendaEvent } from './types';

export const GET_DIVISION_AGENDA: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetDivisionAgenda($divisionId: String!, $visibility: [String!]) {
    division(id: $divisionId) {
      id
      agenda(visibility: $visibility) {
        id
        title
        startTime
        duration
        visibility
        location
      }
    }
  }
`;

export function parseDivisionAgenda(data: QueryData): AgendaEvent[] {
  return data.division?.agenda ?? [];
}
