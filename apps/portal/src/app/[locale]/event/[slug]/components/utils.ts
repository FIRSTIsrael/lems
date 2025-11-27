import { JudgingSession } from '@lems/types/api/portal';

export interface JudgingSessionTime {
  time: Date;
  rooms: Array<{
    id: string;
    name: string;
    session: JudgingSession | null;
    team: JudgingSession['team'];
  }>;
}

export const groupSessionsByTime = (
  sessions: JudgingSession[],
  rooms: Array<{ id: string; name: string }>
): JudgingSessionTime[] => {
  const sessionsByTime = sessions.reduce(
    (acc, session) => {
      session.scheduledTime = new Date(session.scheduledTime);
      const timeKey = session.scheduledTime.getTime();
      if (!acc[timeKey]) {
        acc[timeKey] = {
          time: session.scheduledTime,
          rooms: []
        };
      }
      return acc;
    },
    {} as Record<string, JudgingSessionTime>
  );

  // For each time slot, add all rooms with their teams
  for (const timeKey in sessionsByTime) {
    const timeSlot = sessionsByTime[timeKey];
    timeSlot.rooms = rooms.map(room => {
      const session = sessions.find(
        s => s.room.id === room.id && new Date(s.scheduledTime).getTime() === Number(timeKey)
      );
      return {
        id: room.id,
        name: room.name,
        session: session || null,
        team: session?.team || null
      };
    });
  }

  const sessionTimes = Object.values(sessionsByTime) as JudgingSessionTime[];
  return sessionTimes.sort((a, b) => a.time.getTime() - b.time.getTime());
};
