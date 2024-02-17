import { useMemo } from 'react';
import { WithId } from 'mongodb';
import { Team, EventState, RobotGameMatch } from '@lems/types';
import TeamQueueCard from '../team-queue-card';

interface QueuerTeamDisplayProps {
  teams: Array<WithId<Team>>;
  eventState: WithId<EventState>;
  matches: Array<WithId<RobotGameMatch>>;
}

const QueuerTeamDisplay: React.FC<QueuerTeamDisplayProps> = ({ teams, eventState, matches }) => {
  const calledMatches = useMemo(() => matches.filter(m => m.called), [matches]);

  return calledMatches.map(m =>
    m.participants
      .filter(p => p.teamId && !p.queued)
      .map(({ teamId }, index) => {
        const team = teams.find(t => t._id == teamId);
        return (
          team && (
            <TeamQueueCard key={index} team={team} urgent={eventState.loadedMatch === m._id} />
          )
        );
      })
  );
};

export default QueuerTeamDisplay;
