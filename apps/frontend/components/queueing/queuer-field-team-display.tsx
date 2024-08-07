import { useMemo } from 'react';
import { WithId } from 'mongodb';
import { Team, DivisionState, RobotGameMatch } from '@lems/types';
import TeamQueueCard from './team-queue-card';

interface QueuerFieldTeamDisplayProps {
  teams: Array<WithId<Team>>;
  divisionState: WithId<DivisionState>;
  matches: Array<WithId<RobotGameMatch>>;
}

const QueuerFieldTeamDisplay: React.FC<QueuerFieldTeamDisplayProps> = ({
  teams,
  divisionState,
  matches
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
        return (
          team?.registered && (
            <TeamQueueCard
              key={index}
              team={team}
              location={tableName}
              scheduledTime={match.scheduledTime}
              urgent={divisionState.loadedMatch === match._id}
              urgencyThresholdMinutes={7}
            />
          )
        );
      })
  );
};

export default QueuerFieldTeamDisplay;
