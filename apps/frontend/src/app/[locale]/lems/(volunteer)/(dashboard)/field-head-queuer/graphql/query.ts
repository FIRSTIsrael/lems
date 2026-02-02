import { gql, TypedDocumentNode } from '@apollo/client';
import type { HeadQueuerData, RobotGameMatch } from './types';

export interface QueryData {
  division?: {
    id: string;
    tables: HeadQueuerData['tables'];
    field: {
      loadedMatch: string | null;
      activeMatch: string | null;
      matches: RobotGameMatch[];
    };
  } | null;
}

export interface QueryVars {
  divisionId: string;
}

export const GET_HEAD_QUEUER_DATA: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetHeadQueuerData($divisionId: String!) {
    division(id: $divisionId) {
      id
      tables {
        id
        name
      }
      field {
        divisionId
        loadedMatch
        activeMatch
        matches {
          id
          stage
          number
          scheduledTime
          startTime
          status
          called
          participants {
            id
            team {
              id
              number
              name
              arrived
            }
            table {
              id
              name
            }
            queued
          }
        }
      }
    }
  }
`;

export function parseHeadQueuerData(queryData: QueryData): HeadQueuerData {
  const division = queryData.division;
  
  if (!division) {
    return {
      matches: [],
      tables: [],
      activeMatch: null,
      loadedMatch: null
    };
  }

  const activeMatch = division.field.activeMatch
    ? division.field.matches.find(m => m.id === division.field.activeMatch) || null
    : null;

  const loadedMatch = division.field.loadedMatch
    ? division.field.matches.find(m => m.id === division.field.loadedMatch) || null
    : null;

  return {
    matches: division.field.matches,
    tables: division.tables,
    activeMatch,
    loadedMatch
  };
}
