import { gql, type TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars } from './types';

export const GET_ACTIVE_MATCH_DATA: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetActiveMatchData($divisionId: String!, $activeMatchId: String) {
    division(id: $divisionId) {
      id
      field {
        divisionId
        activeMatch
        matchLength
        matches(ids: $activeMatchId) {
          id
          slug
          stage
          round
          number
          scheduledTime
          status
          startTime
          startDelta
        }
      }
    }
  }
`;

export function parseActiveMatchData(data: QueryData) {
  if (!data.division?.field) {
    return null;
  }

  const { field } = data.division;
  const activeMatch = field.activeMatch
    ? field.matches.find(m => m.id === field.activeMatch) || null
    : null;

  return {
    activeMatch,
    matchLength: field.matchLength
  };
}
