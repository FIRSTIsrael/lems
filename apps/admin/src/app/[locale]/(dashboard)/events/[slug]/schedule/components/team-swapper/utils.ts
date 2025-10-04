import { JudgingSession, Room } from '@lems/types/api/admin';

export interface JudgingSessionTime {
  time: Date;
  rooms: Array<{
    id: string;
    name: string;
    session: JudgingSession | null;
    teamId: string | null;
  }>;
}

export const groupSessionsByTime = (
  sessions: JudgingSession[],
  rooms: Room[]
): JudgingSessionTime[] => {
  const sessionsByTime = sessions.reduce(
    (acc, session) => {
      const timeKey = session.scheduledTime.toISOString();
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
        s => s.roomId === room.id && s.scheduledTime.toISOString() === timeKey
      );
      return {
        id: room.id,
        name: room.name,
        session: session || null,
        teamId: session?.teamId || null
      };
    });
  }

  const sessionTimes = Object.values(sessionsByTime) as JudgingSessionTime[];
  return sessionTimes.sort((a, b) => a.time.getTime() - b.time.getTime());
};
