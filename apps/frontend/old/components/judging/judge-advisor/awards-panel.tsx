import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import {
  Award,
  Division,
  JudgingDeliberation,
  Team,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import DeliberationsPaper from './deliberations-paper';
import AwardsPaper from './awards-paper';

interface AwardsPanelProps {
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  deliberations: Array<WithId<JudgingDeliberation>>;
  awards: Array<WithId<Award>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const AwardsPanel: React.FC<AwardsPanelProps> = ({
  division,
  teams,
  deliberations,
  awards,
  socket
}) => {
  return (
    <>
      <DeliberationsPaper division={division} deliberations={deliberations} />
      <AwardsPaper
        division={division}
        deliberations={deliberations}
        awards={awards}
        teams={teams}
        socket={socket}
      />
    </>
  );
};

export default AwardsPanel;
