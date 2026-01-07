import { gql, TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars } from './types';

export const GET_JUDGING_STATUS: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetJudgingStatus($divisionId: String!) {
    division(id: $divisionId) {
      id
      rooms {
        id
        name
      }
      judging {
        id: divisionId
        divisionId
        sessions {
          id
          number
          scheduledTime
          status
          called
          room {
            id
            name
          }
          team {
            id
            number
            name
            affiliation
            city
            slug
            region
            logoUrl
            arrived
          }
          startTime
          startDelta
        }
        sessionLength
      }
      field {
        divisionId
        activeMatch
        loadedMatch
      }
    }
  }
`;

export function parseJudgingStatus(queryData: QueryData) {
  const sessions = queryData?.division?.judging.sessions ?? [];
  const rooms = queryData?.division?.rooms ?? [];
  const sessionLength = queryData?.division?.judging.sessionLength ?? 0;

  const sessionsByNumber = new Map<number, typeof sessions>();
  sessions.forEach(session => {
    if (!sessionsByNumber.has(session.number)) {
      sessionsByNumber.set(session.number, []);
    }
    sessionsByNumber.get(session.number)!.push(session);
  });

  const sortedSessionNumbers = Array.from(sessionsByNumber.keys()).sort((a, b) => a - b);
  
  let currentRoundNumber = sortedSessionNumbers[0];
  let nextRoundNumber = sortedSessionNumbers[1];

  for (const sessionNumber of sortedSessionNumbers) {
    const roundSessions = sessionsByNumber.get(sessionNumber)!;
    const hasInProgress = roundSessions.some(s => s.status === 'in-progress');
    const hasCompleted = roundSessions.some(s => s.status === 'completed');
    
    if (hasInProgress || hasCompleted) {
      currentRoundNumber = sessionNumber;
      const nextIndex = sortedSessionNumbers.indexOf(sessionNumber) + 1;
      nextRoundNumber = nextIndex < sortedSessionNumbers.length ? sortedSessionNumbers[nextIndex] : sessionNumber;
    }
  }

  const currentSessions = sessionsByNumber.get(currentRoundNumber) ?? [];
  const nextSessions = sessionsByNumber.get(nextRoundNumber) ?? [];

  return {
    sessions: currentSessions,
    nextSessions: nextRoundNumber !== currentRoundNumber ? nextSessions : [],
    rooms,
    sessionLength
  };
}
