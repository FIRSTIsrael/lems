import { IconButton, IconButtonProps } from '@mui/material';
import StopCircleOutlinedIcon from '@mui/icons-material/StopCircleOutlined';
import { enqueueSnackbar } from 'notistack';
import { WithId } from 'mongodb';
import { Division, JudgingRoom, JudgingSession, WSServerEmittedEvents, WSClientEmittedEvents } from '@lems/types';
import { Socket } from 'socket.io-client';

interface FinishJudgingSessionButtonProps extends IconButtonProps {
  division: WithId<Division>;
  room: WithId<JudgingRoom>;
  session: WithId<JudgingSession>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const FinishJudgingSessionButton: React.FC<FinishJudgingSessionButtonProps> = ({
  division,
  room,
  session,
  socket,
  ...props
}) => {

  const finishSession = (divisionId: string, roomId: string, sessionId: string): void => {
    socket.emit('finishJudgingSession', divisionId, roomId, sessionId, response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, סיום מפגש השיפוט נכשל.', { variant: 'error' });
      } else {
        enqueueSnackbar('המפגש הסתיים בהצלחה!', { variant: 'success' });
      }
    });
  };

  return (
    <IconButton
      aria-label="Finish session"
      onClick={() => finishSession(division._id.toString(), room._id.toString(), session._id.toString())}
      sx={{ color: '#d32f2f' }}
      {...props}
    >
      <StopCircleOutlinedIcon />
    </IconButton>
  );
};

export default FinishJudgingSessionButton;
