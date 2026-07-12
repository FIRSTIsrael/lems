import { gql, TypedDocumentNode } from '@apollo/client';
import type { HeadQueuerData, JudgingSession } from './types';

export interface QueryData {
  division?: {
    id: string;
    rooms: HeadQueuerData['rooms'];
    judging: {
      sessions: JudgingSession[];
    };
  } | null;
}

export interface QueryVars {
  divisionId: string;
}

export const GET_HEAD_QUEUER_DATA: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetJudgingHeadQueuerData($divisionId: String!) {
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
    }
  }
`;

export function parseHeadQueuerData(queryData: QueryData): HeadQueuerData {
  const division = queryData.division;

  if (!division) {
    return {
      sessions: [],
      rooms: [],
      currentSessions: [],
      upcomingSessions: []
    };
  }

  const sessions = division.judging.sessions;

  // Current sessions are those in-progress
  const currentSessions = sessions.filter(s => s.status === 'in-progress');

  // Upcoming sessions are not-started and called, sorted by scheduled time
  const upcomingSessions = sessions
    .filter(s => s.status === 'not-started' && s.called)
    .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  return {
    sessions: division.judging.sessions,
    rooms: division.rooms,
    currentSessions,
    upcomingSessions
  };
}
