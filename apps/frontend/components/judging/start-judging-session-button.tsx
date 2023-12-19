import { useState, useEffect } from 'react';
import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import { Socket } from 'socket.io-client';
import { IconButton, IconButtonProps } from '@mui/material';
import PlayCircleFilledWhiteOutlinedIcon from '@mui/icons-material/PlayCircleFilledWhiteOutlined';
import {
  Event,
  JudgingRoom,
  JudgingSession,
  Team,
  Status,
  WSServerEmittedEvents,
  WSClientEmittedEvents
} from '@lems/types';
import { enqueueSnackbar } from 'notistack';

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

interface StartJudgingSessionButtonProps extends IconButtonProps {
  event: WithId<Event>;
  room: WithId<JudgingRoom>;
  session: WithId<JudgingSession>;
  team: WithId<Team>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const StartJudgingSessionButton: React.FC<StartJudgingSessionButtonProps> = ({
  event,
  room,
  session,
  team,
  socket,
  ...props
}) => {
  const [isDisabled, setIsDisabled] = useState<boolean>(
    dayjs() <= dayjs(session.scheduledTime).subtract(5, 'minutes') || !team.registered
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setIsDisabled(
        dayjs() <= dayjs(session.scheduledTime).subtract(5, 'minutes') || !team.registered
      );
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSession = (eventId: string, roomId: string, sessionId: string) => {
    socket.emit('startJudgingSession', eventId, roomId, sessionId, response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, התחלת מפגש השיפוט נכשלה.', { variant: 'error' });
      } else {
        new Audio('/assets/sounds/judging/judging-start.wav').play();
      }
    });
  };

  return (
    <IconButton
      aria-label="Start session"
      onClick={
        session.status === 'not-started'
          ? () => startSession(event._id.toString(), room._id.toString(), session._id.toString())
          : undefined
      }
      disabled={isDisabled}
      sx={{
        color: getButtonColor(session.status),
        ...(session.status !== 'not-started' && {
          '&:hover': { backgroundColor: '#fff', cursor: 'default' }
        })
      }}
      {...props}
    >
      <PlayCircleFilledWhiteOutlinedIcon />
    </IconButton>
  );
};

export default StartJudgingSessionButton;
