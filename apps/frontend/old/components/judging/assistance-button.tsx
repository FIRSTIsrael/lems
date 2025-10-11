import { useState } from 'react';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import { Fab, FabProps } from '@mui/material';
import SosRoundedIcon from '@mui/icons-material/SosRounded';
import { Division, JudgingRoom, WSClientEmittedEvents, WSServerEmittedEvents } from '@lems/types';

interface AssistanceButtonProps extends FabProps {
  division: WithId<Division>;
  room: WithId<JudgingRoom>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const AssistanceButton: React.FC<AssistanceButtonProps> = ({
  division,
  room,
  socket,
  ...props
}) => {
  const [disabled, setDisabled] = useState(false);

  const handleClick = () => {
    socket.emit('callLeadJudge', division._id.toString(), room._id.toString(), response => {
      if (response.ok) {
        enqueueSnackbar('הקריאה לעזרה התקבלה.', { variant: 'success' });
      } else {
        enqueueSnackbar('אופס, הקריאה לעזרה נכשלה.', { variant: 'error' });
      }
    });

    setDisabled(true);
    setTimeout(() => setDisabled(false), 5000);
  };

  return (
    <Fab {...props} color="error" onClick={handleClick} disabled={disabled}>
      <SosRoundedIcon />
    </Fab>
  );
};

export default AssistanceButton;
