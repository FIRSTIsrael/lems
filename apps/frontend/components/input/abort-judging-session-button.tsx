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
  JudgingServerEmittedEvents,
  JudgingClientEmittedEvents
} from '@lems/types';
import { useState } from 'react';

interface Props extends ButtonProps {
  event: WithId<Event>;
  room: WithId<JudgingRoom>;
  session: WithId<JudgingSession>;
  socket: Socket<JudgingServerEmittedEvents, JudgingClientEmittedEvents>;
}

const AbortJudgingSessionButton: React.FC<Props> = ({ event, room, session, socket, ...props }) => {
  const [open, setOpen] = useState<boolean>(false);

  const abortSession = (eventId: string, roomId: string, sessionId: string) => {
    socket.emit('abortSession', eventId, roomId, sessionId, response => {
      // { ok: true }
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
        הפסק מפגש שיפוט
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="abort-dialog-title"
        aria-describedby="abort-dialog-description"
      >
        <DialogTitle id="abort-dialog-title">הפסקת מפגש שיפוט</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            שימו לב! הפסקת מפגש השיפוט יתריע על כך למערכות האירוע ויחייב אתכם לקיים את מפגש השיפוט
            במלואו עם הקבוצה לפני מילוי המחוונים. האם אתם בטוחים?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} autoFocus>
            ביטול
          </Button>
          <Button
            onClick={() =>
              abortSession(event._id.toString(), room._id.toString(), session._id.toString())
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
