import { gql, TypedDocumentNode } from '@apollo/client';
import type { JudgingQueuerData, JudgingSession, RobotGameMatch } from './types';

export interface QueryData {
  division?: {
    id: string;
    rooms: Array<{ id: string; name: string }>;
    judging: {
      sessions: JudgingSession[];
    };
    field: {
      matches: RobotGameMatch[];
    };
  } | null;
}

export interface QueryVars {
  divisionId: string;
}

export const GET_JUDGING_QUEUER_DATA: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetJudgingQueuerData($divisionId: String!) {
    division(id: $divisionId) {
      id
      rooms {
        id
        name
      }
      judging {
        divisionId
        sessions {
          id
          number
          scheduledTime
          startTime
          status
          called
          queued
          team {
            id
            number
            name
            arrived
          }
          room {
            id
            name
          }
        }
      }
      field {
        divisionId
        matches {
          id
          stage
          number
          scheduledTime
          startTime
          status
          called
        }
      }
    }
  }
`;

export function parseJudgingQueuerData(queryData: QueryData): JudgingQueuerData {
  const division = queryData.division;

  if (!division) {
    return {
      sessions: [],
      matches: [],
      rooms: []
    };
  }

  return {
    sessions: division.judging.sessions,
    matches: division.field.matches,
    rooms: division.rooms
  };
}
