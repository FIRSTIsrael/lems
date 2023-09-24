import { useCallback, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Button, Stack } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { WSClientEmittedEvents, WSServerEmittedEvents } from '@lems/types';

interface ControlActionsProps {
  eventId: string;
  nextMatchNumber?: number;
  loadedMatchNumber?: number;
  activeMatchNumber?: number;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const ControlActions: React.FC<ControlActionsProps> = ({
  eventId,
  nextMatchNumber,
  loadedMatchNumber,
  activeMatchNumber,
  socket
}) => {
  const [previewShown, setPreviewShown] = useState<boolean>(false);
  const [matchShown, setMatchShown] = useState<boolean>(false);

  const loadNextMatch = useCallback(() => {
    socket.emit('loadMatch', eventId, nextMatchNumber || 0, response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
      }
    });
  }, [eventId, nextMatchNumber, socket]);

  const startMatch = useCallback(() => {
    socket.emit('startMatch', eventId, loadedMatchNumber || 0, response => {
      if (!response.ok) {
        enqueueSnackbar('אופס, הזנקת המקצה נכשלה.', { variant: 'error' });
      }
    });
  }, [eventId, loadedMatchNumber, socket]);

  useEffect(() => {
    setPreviewShown(false);
    setMatchShown(false);
  }, [loadedMatchNumber]);

  return (
    <Stack direction="row" spacing={1} justifyContent="center">
      <Button
        variant="contained"
        color={loadedMatchNumber !== undefined ? 'inherit' : 'success'}
        disabled={loadedMatchNumber !== undefined}
        size="large"
        onClick={loadNextMatch}
      >
        טעינת המקצה הבא
      </Button>
      <Button
        variant="contained"
        color={loadedMatchNumber === undefined ? 'inherit' : previewShown ? 'warning' : 'success'}
        disabled={loadedMatchNumber === undefined || activeMatchNumber !== undefined}
        size="large"
        onClick={() => setPreviewShown(true)}
      >
        הצגת Preview
      </Button>
      <Button
        variant="contained"
        color={loadedMatchNumber === undefined ? 'inherit' : matchShown ? 'warning' : 'success'}
        disabled={loadedMatchNumber === undefined || activeMatchNumber !== undefined}
        size="large"
        onClick={() => setMatchShown(true)}
      >
        הצגת המקצה
      </Button>
      <Button
        variant="contained"
        color={loadedMatchNumber === undefined ? 'inherit' : 'success'}
        disabled={loadedMatchNumber === undefined || activeMatchNumber !== undefined}
        size="large"
        onClick={startMatch}
      >
        התחלת המקצה
      </Button>
    </Stack>
  );
};

export default ControlActions;
