import { useMemo } from 'react';
import { WithId } from 'mongodb';
import { Team, DivisionState, RobotGameMatch, JudgingSession } from '@lems/types';
import TeamQueueCard from './team-queue-card';

interface QueuerFieldTeamDisplayProps {
  teams: Array<WithId<Team>>;
  divisionState: WithId<DivisionState>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
}

const QueuerFieldTeamDisplay: React.FC<QueuerFieldTeamDisplayProps> = ({
  teams,
  divisionState,
  matches,
  sessions
}) => {
  const calledMatches = useMemo(
    () => matches.filter(m => m.called && m.status === 'not-started'),
    [matches]
  );

  return calledMatches.map(match =>
    match.participants
      .filter(p => p.teamId && !p.queued)
      .map(({ teamId, tableName }, index) => {
        const team = teams.find(t => t._id == teamId);
        const teamInJudging = !!sessions
          .filter(
            s => s.status === 'in-progress' || (s.status === 'not-started' && s.called && s.queued)
          )
          .find(s => s.teamId === teamId);
        return (
          team?.registered && (
            <TeamQueueCard
              key={index}
              team={team}
              location={tableName}
              scheduledTime={match.scheduledTime}
              isBusy={teamInJudging ? 'judging' : undefined}
              urgent={divisionState.loadedMatch === match._id}
              urgencyThresholdMinutes={7}
            />
          )
        );
      })
  );
};

export default QueuerFieldTeamDisplay;
