import React, { useState } from 'react';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import { Button, Paper, Stack, TextField } from '@mui/material';
import { EventState, WSServerEmittedEvents, WSClientEmittedEvents } from '@lems/types';

interface MessageEditorProps {
  eventState: WithId<EventState>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const MessageEditor: React.FC<MessageEditorProps> = ({ eventState, socket }) => {
  const [message, setMessage] = useState<string>(eventState.audienceDisplay.message);

  const updateMessage = (newMessage: string) => {
    socket.emit(
      'updateAudienceDisplay',
      eventState.eventId.toString(),
      { message: newMessage },
      response => {
        if (!response.ok) enqueueSnackbar('אופס, עדכון ההודעה נכשל.', { variant: 'error' });
      }
    );
  };

  return (
    <Stack
      component={Paper}
      p={4}
      mt={2}
      justifyContent="center"
      spacing={2}
      maxWidth="50%"
      minWidth={450}
    >
      <TextField multiline value={message} onChange={e => setMessage(e.target.value)}></TextField>
      <Stack direction="row" justifyContent="center" spacing={2}>
        <Button variant="contained" onClick={e => updateMessage(message)}>
          הצג
        </Button>
        <Button
          variant="contained"
          onClick={e => {
            setMessage('');
            updateMessage('');
          }}
        >
          נקה
        </Button>
      </Stack>
    </Stack>
  );
};

export default MessageEditor;
