import { useMemo } from 'react';
import { WithId } from 'mongodb';
import { Team, JudgingSession, JudgingRoom, RobotGameMatch } from '@lems/types';
import TeamQueueCard from './team-queue-card';

interface QueuerJudgingTeamDisplayProps {
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
  matches: Array<WithId<RobotGameMatch>>;
  activeMatch: WithId<RobotGameMatch> | null;
  loadedMatch: WithId<RobotGameMatch> | null;
}

const QueuerJudgingTeamDisplay: React.FC<QueuerJudgingTeamDisplayProps> = ({
  teams,
  sessions,
  rooms,
  matches,
  activeMatch,
  loadedMatch
}) => {
  const calledSessions = useMemo(() => sessions.filter(m => m.called), [sessions]);

  return calledSessions
    .filter(s => !s.queued && s.status === 'not-started')
    .map(session => {
      const team = teams.find(t => t._id === session.teamId);
      const room = rooms.find(r => r._id === session.roomId);
      const teamOnField =
        !!activeMatch?.participants.find(p => p.teamId === team?._id) ||
        !!loadedMatch?.participants.find(p => p.teamId === team?._id) ||
        !!matches
          .filter(m => m.called && m.status === 'not-started')
          .some(m => m.participants.some(p => p.teamId === team?._id && p.queued));
      return (
        team?.registered && (
          <TeamQueueCard
            key={session._id.toString()}
            team={team}
            location={room?.name}
            isBusy={teamOnField}
            section="field"
            scheduledTime={session.scheduledTime}
            urgencyThresholdMinutes={10}
          />
        )
      );
    });
};

export default QueuerJudgingTeamDisplay;
