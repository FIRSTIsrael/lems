import { useCallback, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Button, Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { ObjectId } from 'mongodb';
import { WSClientEmittedEvents, WSServerEmittedEvents } from '@lems/types';

interface ControlActionsProps {
  eventId: string;
  nextMatchId?: ObjectId;
  loadedMatchId?: ObjectId;
  activeMatchId?: ObjectId;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const ControlActions: React.FC<ControlActionsProps> = ({
  eventId,
  nextMatchId,
  loadedMatchId,
  activeMatchId,
  socket
}) => {
  const [matchShown, setMatchShown] = useState<boolean>(false);

  const loadNextMatch = useCallback(() => {
    if (nextMatchId === undefined) return;
    socket.emit('loadMatch', eventId, nextMatchId.toString(), response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
      }
    });
  }, [eventId, nextMatchId, socket]);

  const startMatch = useCallback(() => {
    if (loadedMatchId === undefined) return;
    socket.emit('startMatch', eventId, loadedMatchId.toString(), response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, הזנקת המקצה נכשלה.', { variant: 'error' });
      }
    });
  }, [eventId, loadedMatchId, socket]);

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
  }, [loadedMatchId]);

  return (
    <Stack direction="row" spacing={1} justifyContent="center">
      <Button
        variant="contained"
        color={loadedMatchId === nextMatchId ? 'inherit' : 'success'}
        disabled={loadedMatchId === nextMatchId}
        size="large"
        onClick={loadNextMatch}
      >
        טעינת המקצה הבא
      </Button>
      <Button
        variant="contained"
        color={loadedMatchId === undefined ? 'inherit' : matchShown ? 'warning' : 'success'}
        disabled={loadedMatchId === undefined || activeMatchId !== undefined}
        size="large"
        onClick={() => setMatchShown(true)}
      >
        הצגת המקצה
      </Button>
      {activeMatchId === undefined ? (
        <Button
          variant="contained"
          color={loadedMatchId === undefined ? 'inherit' : 'success'}
          disabled={loadedMatchId === undefined || activeMatchId !== undefined}
          size="large"
          onClick={startMatch}
        >
          התחלת המקצה
        </Button>
      ) : (
        <Button variant="contained" color="error" size="large" onClick={abortMatch}>
          עצירת המקצה
        </Button>
      )}
    </Stack>
  );
};

export default ControlActions;
