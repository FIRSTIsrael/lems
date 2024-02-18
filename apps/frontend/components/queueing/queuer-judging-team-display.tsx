import { useMemo } from 'react';
import { WithId } from 'mongodb';
import { Team, JudgingSession, JudgingRoom } from '@lems/types';
import TeamQueueCard from './team-queue-card';

interface QueuerJudgingTeamDisplayProps {
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
}

const QueuerJudgingTeamDisplay: React.FC<QueuerJudgingTeamDisplayProps> = ({
  teams,
  sessions,
  rooms
}) => {
  const calledSessions = useMemo(() => sessions.filter(m => m.called), [sessions]);

  return calledSessions
    .filter(s => !s.queued)
    .map(session => {
      const team = teams.find(t => t._id === session.teamId);
      const room = rooms.find(r => r._id === session.roomId);
      return (
        team?.registered && (
          <TeamQueueCard
            key={session._id.toString()}
            team={team}
            location={room?.name}
            scheduledTime={session.scheduledTime}
            urgencyThresholdMinutes={10}
          />
        )
      );
    });
};

export default QueuerJudgingTeamDisplay;
