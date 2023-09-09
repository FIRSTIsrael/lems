import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { Socket } from 'socket.io-client';
import { IconButton, IconButtonProps } from '@mui/material';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import {
  Event,
  JudgingRoom,
  JudgingSession,
  Status,
  JudgingServerEmittedEvents,
  JudgingClientEmittedEvents
} from '@lems/types';

const getButtonColor = (status: Status) => {
  switch (status) {
    case 'not-started':
      return '#4c78f5';
    case 'in-progress':
      return '#f58a4c';
    case 'completed':
      return '#138a17';
  }
};

const canStart = (session: JudgingSession) => {
  return session.status === 'not-started' && dayjs() > dayjs(session.time).subtract(5, 'minutes');
};

interface Props extends IconButtonProps {
  event: WithId<Event>;
  room: WithId<JudgingRoom>;
  session: WithId<JudgingSession>;
  socket: Socket<JudgingServerEmittedEvents, JudgingClientEmittedEvents>;
}

const StartJudgingSessionButton: React.FC<Props> = ({ event, room, session, socket, ...props }) => {
  const startSession = (eventId: string, roomId: string, sessionId: string) => {
    socket.emit('startSession', eventId, roomId, sessionId, response => {
      console.log(response);
    });
  };

  return (
    <IconButton
      aria-label="Start session"
      onClick={() =>
        startSession(event._id.toString(), room._id.toString(), session._id.toString())
      }
      disabled={!canStart(session)}
      sx={{ color: getButtonColor(session.status) }}
      {...props}
    >
      <PlayCircleFilledWhiteOutlinedIcon />
    </IconButton>
  );
};

export default StartJudgingSessionButton;
