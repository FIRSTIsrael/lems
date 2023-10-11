import { ObjectId, WithId } from 'mongodb';
import { Paper, Stack } from '@mui/material';
import {
  Event,
  EventState,
  RobotGameMatch,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import ActiveMatch from './active-match';
import Schedule from './schedule';
import ControlActions from './control-actions';
import { useMemo } from 'react';
import { Socket } from 'socket.io-client';

interface FieldControlProps {
  event: WithId<Event>;
  eventState: EventState;
  matches: Array<WithId<RobotGameMatch>>;
  nextMatchId: ObjectId | undefined;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const FieldControl: React.FC<FieldControlProps> = ({
  event,
  eventState,
  matches,
  nextMatchId,
  socket
}) => {
  const activeMatch = useMemo(
    () =>
      matches.find(match => match._id === eventState.activeMatch) || ({} as WithId<RobotGameMatch>),
    [eventState.activeMatch, matches]
  );
  const loadedMatch = useMemo(
    () =>
      matches.find(match => match._id === eventState.loadedMatch) || ({} as WithId<RobotGameMatch>),
    [eventState.loadedMatch, matches]
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
        <ActiveMatch
          title="המקצה הבא"
          match={
            matches.find(match => match._id === eventState.loadedMatch) ||
            ({} as WithId<RobotGameMatch>)
          }
        />
      </Stack>

      <ControlActions
        eventId={event._id.toString()}
        nextMatchId={nextMatchId}
        loadedMatch={loadedMatch}
        activeMatchId={activeMatch._id}
        socket={socket}
      />

      <Paper sx={{ px: 4, py: 1, mt: 2, overflowY: 'scroll' }}>
        <Schedule
          eventId={event._id.toString()}
          matches={matches.filter(m => m.stage !== 'test') || []}
          socket={socket}
        />
      </Paper>
    </Stack>
  );
};

export default FieldControl;
