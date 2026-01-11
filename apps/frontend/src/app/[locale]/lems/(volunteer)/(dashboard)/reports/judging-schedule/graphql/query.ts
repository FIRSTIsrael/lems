import { gql, TypedDocumentNode } from '@apollo/client';
import type { QueryData, QueryVars, Room, JudgingSession, ScheduleRow } from './types';

export const GET_JUDGING_SCHEDULE: TypedDocumentNode<QueryData, QueryVars> = gql`
  query GetJudgingSchedule($divisionId: String!) {
    division(id: $divisionId) {
      id
      rooms {
        id
        name
      }
      agenda(visibility: ["public", "judging"]) {
        id
        title
        startTime
        duration
        visibility
      }
      judging {
        divisionId
        sessionLength
        sessions {
          id
          number
          scheduledTime
          status
          room {
            id
            name
          }
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

export function parseJudgingSchedule(data: QueryData): {
  rooms: Room[];
  rows: ScheduleRow[];
  sessionLength: number;
} {
  if (!data.division) {
    return { rooms: [], rows: [], sessionLength: 0 };
  }

  const { rooms, agenda, judging } = data.division;
  const sessions = judging.sessions;
  const sessionLength = judging.sessionLength;

  const sessionsByTime = new Map<number, JudgingSession[]>();
  sessions.forEach(session => {
    const time = new Date(session.scheduledTime).getTime();
    if (!sessionsByTime.has(time)) {
      sessionsByTime.set(time, []);
    }
    sessionsByTime.get(time)!.push(session);
  });

  const rows: ScheduleRow[] = [];

  sessionsByTime.forEach((timeSessions, timeKey) => {
    const roomAssignments = rooms.map(room => {
      const session = timeSessions.find(s => s.room.id === room.id);
      return {
        id: room.id,
        name: room.name,
        team: session?.team || null
      };
    });

    rows.push({
      type: 'session',
      time: new Date(timeKey),
      rooms: roomAssignments
    });
  });

  agenda.forEach(event => {
    rows.push({
      type: 'agenda',
      time: new Date(event.startTime),
      agendaEvent: event
    });
  });

  rows.sort((a, b) => a.time.getTime() - b.time.getTime());

  return { rooms, rows, sessionLength };
}
