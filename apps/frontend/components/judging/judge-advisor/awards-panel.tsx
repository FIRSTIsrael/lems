import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { Award, Division, Team, WSServerEmittedEvents, WSClientEmittedEvents } from '@lems/types';
import ResultExportPaper from './result-export-paper';

interface AwardsPanelProps {
  awards: Array<WithId<Award>>;
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
  readOnly: boolean;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const AwardsPanel: React.FC<AwardsPanelProps> = ({ division }) => {
  return (
    <>
      <ResultExportPaper division={division} />
    </>
  );
};

export default AwardsPanel;
