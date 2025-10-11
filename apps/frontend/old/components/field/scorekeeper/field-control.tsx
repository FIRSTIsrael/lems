import { useMemo } from 'react';
import { Socket } from 'socket.io-client';
import { ObjectId, WithId } from 'mongodb';
import { Paper, Stack } from '@mui/material';
import {
  Division,
  DivisionState,
  RobotGameMatch,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import ActiveMatch from './active-match';
import Schedule from './schedule';
import ControlActions from './control-actions';

interface FieldControlProps {
  division: WithId<Division>;
  divisionState: DivisionState;
  matches: Array<WithId<RobotGameMatch>>;
  nextMatchId: ObjectId | undefined;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const FieldControl: React.FC<FieldControlProps> = ({
  division,
  divisionState,
  matches,
  nextMatchId,
  socket
}) => {
  const activeMatch = useMemo(
    () => matches.find(match => match._id === divisionState.activeMatch) || null,
    [divisionState.activeMatch, matches]
  );
  const loadedMatch = useMemo(
    () => matches.find(match => match._id === divisionState.loadedMatch) || null,
    [divisionState.loadedMatch, matches]
  );

  return (
    <Stack
      sx={{
        height: 'calc(100vh - 168px)',
        overflow: 'hidden'
      }}
    >
      <Stack direction="row" spacing={2} mb={2}>
        <ActiveMatch title="מקצה רץ" match={activeMatch} startTime={activeMatch?.startTime} />
        <ActiveMatch title="המקצה הבא" match={loadedMatch} showDelay={true} />
      </Stack>

      <ControlActions
        divisionId={division._id.toString()}
        nextMatchId={nextMatchId}
        loadedMatch={loadedMatch}
        activeMatchId={activeMatch?._id || null}
        socket={socket}
      />

      <Paper sx={{ px: 4, py: 1, mt: 2, overflowY: 'scroll' }}>
        <Schedule
          divisionId={division._id.toString()}
          matches={matches.filter(m => m.stage !== 'test') || []}
          socket={socket}
        />
      </Paper>
    </Stack>
  );
};

export default FieldControl;
