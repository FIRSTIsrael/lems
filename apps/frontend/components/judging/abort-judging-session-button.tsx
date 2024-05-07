import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import {
  Button,
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';
import {
  Event,
  JudgingRoom,
  JudgingSession,
  WSServerEmittedEvents,
  WSClientEmittedEvents
} from '@lems/types';
import { useState } from 'react';
import { enqueueSnackbar } from 'notistack';

interface AbortJudgingSessionButtonProps extends ButtonProps {
  division: WithId<Event>;
  room: WithId<JudgingRoom>;
  session: WithId<JudgingSession>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const AbortJudgingSessionButton: React.FC<AbortJudgingSessionButtonProps> = ({
  division,
  room,
  session,
  socket,
  ...props
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const abortSession = (divisionId: string, roomId: string, sessionId: string) => {
    socket.emit('abortJudgingSession', divisionId, roomId, sessionId, response => {
      if (response.ok) {
        enqueueSnackbar('מפגש השיפוט הופסק בהצלחה!', { variant: 'success' });
      } else {
        enqueueSnackbar('אופס, ביטול מפגש השיפוט נכשל.', { variant: 'error' });
      }
    });
  };

  return (
    <>
      <Button
        aria-label="Abort session"
        onClick={() => setOpen(true)}
        startIcon={<DangerousOutlinedIcon />}
        color="error"
        variant="contained"
        {...props}
      >
        ביטול מפגש השיפוט
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="abort-dialog-title"
        aria-describedby="abort-dialog-description"
      >
        <DialogTitle id="abort-dialog-title">ביטול מפגש שיפוט</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            שימו לב! ביטול מפגש השיפוט יתריע על כך למערכות האירוע ויחייב אתכם לקיים את מפגש השיפוט
            במלואו עם הקבוצה לפני מילוי המחוונים. האם אתם בטוחים?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} autoFocus>
            ביטול
          </Button>
          <Button
            onClick={() =>
              abortSession(division._id.toString(), room._id.toString(), session._id.toString())
            }
          >
            אישור
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AbortJudgingSessionButton;
