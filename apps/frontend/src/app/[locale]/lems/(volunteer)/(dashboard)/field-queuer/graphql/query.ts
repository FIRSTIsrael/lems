import { gql, TypedDocumentNode } from '@apollo/client';
import type { FieldQueuerData, RobotGameMatch, JudgingSession } from './types';

export interface QueryData {
  division?: {
    id: string;
    field: {
      loadedMatch: string | null;
      matches: RobotGameMatch[];
    };
    judging: {
      sessions: JudgingSession[];
    };
  } | null;
}

export interface QueryVars {
  divisionId: string;
}

export const GET_FIELD_QUEUER_DATA: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetFieldQueuerData($divisionId: String!) {
    division(id: $divisionId) {
      id
      field {
        divisionId
        loadedMatch
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
      judging {
        divisionId
        sessions {
          id
          status
          called
          team {
            id
            number
            name
            arrived
          }
        }
      }
    }
  }
`;

export function parseFieldQueuerData(queryData: QueryData): FieldQueuerData {
  const division = queryData.division;
  
  if (!division) {
    return {
      matches: [],
      sessions: [],
      loadedMatch: null
    };
  }

  const loadedMatch = division.field.loadedMatch
    ? division.field.matches.find(m => m.id === division.field.loadedMatch) || null
    : null;

  return {
    matches: division.field.matches,
    sessions: division.judging.sessions,
    loadedMatch
  };
}
