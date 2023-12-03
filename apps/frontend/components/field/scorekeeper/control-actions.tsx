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
  nextMatchId: ObjectId | null;
  loadedMatch: WithId<RobotGameMatch> | null;
  activeMatchId: ObjectId | null;
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
    if (!nextMatchId) return;
    socket.emit('loadMatch', eventId, nextMatchId.toString(), response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
      }
    });
  }, [eventId, nextMatchId, socket]);

  const startMatch = useCallback(() => {
    if (!loadedMatch) return;
    socket.emit('startMatch', eventId, loadedMatch._id.toString(), response => {
      if (!response.ok) enqueueSnackbar('אופס, הזנקת המקצה נכשלה.', { variant: 'error' });
    });

    socket.emit('updateAudienceDisplay', eventId, { screen: 'scores' }, response => {
      if (!response.ok) enqueueSnackbar('אופס, עדכון תצוגת הקהל נכשל.', { variant: 'error' });
    });
  }, [eventId, loadedMatch, socket]);

  const startTestMatch = useCallback(() => {
    if (activeMatchId) return;
    socket.emit('startTestMatch', eventId, response => {
      if (!response.ok) enqueueSnackbar('אופס, הזנקת המקצה נכשלה.', { variant: 'error' });
    });
  }, [eventId, activeMatchId, socket]);

  const abortMatch = useCallback(() => {
    if (!activeMatchId) return;
    socket.emit('abortMatch', eventId, activeMatchId.toString(), response => {
      if (!response.ok) enqueueSnackbar('אופס, עצירת המקצה נכשלה.', { variant: 'error' });
    });
    setOpen(false);
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
        color={!loadedMatch?._id ? 'inherit' : matchShown ? 'primary' : 'success'}
        disabled={!loadedMatch?._id || !!activeMatchId}
        size="large"
        onClick={() => {
          setMatchShown(true);
          socket.emit('updateAudienceDisplay', eventId, { screen: 'match-preview' }, response => {
            if (!response.ok) enqueueSnackbar('אופס, עדכון תצוגת הקהל נכשל.', { variant: 'error' });
          });
        }}
      >
        הצגת המקצה
      </Button>
      {!activeMatchId ? (
        <Button
          variant="contained"
          color={
            !loadedMatch?._id
              ? 'inherit'
              : loadedMatch.participants.filter(p => p.teamId).find(p => !p.ready)
              ? 'warning'
              : 'success'
          }
          disabled={!loadedMatch?._id}
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
