import { gql, TypedDocumentNode } from '@apollo/client';

export interface AgendaEvent {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  visibility: string;
}

interface QueryData {
  division?: {
    id: string;
    agenda: AgendaEvent[];
  } | null;
}

interface QueryVars {
  divisionId: string;
  visibility?: string[];
}

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
      }
    }
  }
`;

export function parseDivisionAgenda(data: QueryData): AgendaEvent[] {
  return data.division?.agenda ?? [];
}
