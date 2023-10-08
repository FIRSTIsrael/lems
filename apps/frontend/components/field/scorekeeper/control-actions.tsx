import { useCallback, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { ObjectId, WithId } from 'mongodb';
import { RobotGameMatch, WSClientEmittedEvents, WSServerEmittedEvents } from '@lems/types';

interface ControlActionsProps {
  eventId: string;
  nextMatchId?: ObjectId;
  loadedMatch?: WithId<RobotGameMatch>;
  activeMatchId?: ObjectId;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const ControlActions: React.FC<ControlActionsProps> = ({
  eventId,
  nextMatchId,
  loadedMatch,
  activeMatchId,
  socket
}) => {
  const [matchShown, setMatchShown] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);

  const loadNextMatch = useCallback(() => {
    if (nextMatchId === undefined) return;
    socket.emit('loadMatch', eventId, nextMatchId.toString(), response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
      }
    });
  }, [eventId, nextMatchId, socket]);

  const startMatch = useCallback(() => {
    if (loadedMatch === undefined) return;
    socket.emit('startMatch', eventId, loadedMatch._id.toString(), response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, הזנקת המקצה נכשלה.', { variant: 'error' });
      }
    });
  }, [eventId, loadedMatch, socket]);

  const startTestMatch = useCallback(() => {
    if (activeMatchId) return;
    socket.emit('startTestMatch', eventId, response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, הזנקת המקצה נכשלה.', { variant: 'error' });
      }
    });
  }, [eventId, activeMatchId, socket]);

  const abortMatch = useCallback(() => {
    if (activeMatchId === undefined) return;
    socket.emit('abortMatch', eventId, activeMatchId.toString(), response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, עצירת המקצה נכשלה.', { variant: 'error' });
      }
    });
  }, [activeMatchId, eventId, socket]);

  useEffect(() => {
    setMatchShown(false);
  }, [loadedMatch]);

  return (
    <Stack direction="row" spacing={1} justifyContent="center">
      <Button
        variant="contained"
        color={'success'}
        disabled={!!activeMatchId}
        size="large"
        onClick={startTestMatch}
      >
        התחלת מקצה בדיקה
      </Button>
      <Button
        variant="contained"
        color={loadedMatch?._id === nextMatchId ? 'inherit' : 'success'}
        disabled={loadedMatch?._id === nextMatchId}
        size="large"
        onClick={loadNextMatch}
      >
        טעינת המקצה הבא
      </Button>
      <Button
        variant="contained"
        color={loadedMatch?._id === undefined ? 'inherit' : matchShown ? 'warning' : 'success'}
        disabled={loadedMatch?._id === undefined || activeMatchId !== undefined}
        size="large"
        onClick={() => setMatchShown(true)}
      >
        הצגת המקצה
      </Button>
      {activeMatchId === undefined ? (
        <Button
          variant="contained"
          color={loadedMatch?._id === undefined ? 'inherit' : 'success'}
          disabled={
            loadedMatch?._id === undefined ||
            activeMatchId !== undefined ||
            !!loadedMatch.participants.find(p => !p.ready)
          }
          size="large"
          onClick={startMatch}
        >
          התחלת המקצה
        </Button>
      ) : (
        <>
          <Button variant="contained" color="error" size="large" onClick={() => setOpen(true)}>
            עצירת המקצה
          </Button>
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            aria-labelledby="abort-dialog-title"
            aria-describedby="abort-dialog-description"
          >
            <DialogTitle id="abort-dialog-title">הפסקת המקצה</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                האם אתם בטוחים שאתם רוצים להפסיק את המקצה?
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpen(false)} autoFocus>
                ביטול
              </Button>
              <Button onClick={abortMatch}>אישור</Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Stack>
  );
};

export default ControlActions;
