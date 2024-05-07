import { useState } from 'react';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { Stack, Button } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import AddIcon from '@mui/icons-material/Add';
import {
  SafeUser,
  CoreValuesForm,
  Event,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import CVFormCard from './cv-form-card';
import CVForm from './cv-form';

interface CVPanelProps {
  user: WithId<SafeUser>;
  cvForms: Array<WithId<CoreValuesForm>>;
  division: WithId<Event>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const CVPanel: React.FC<CVPanelProps> = ({ user, cvForms, division, socket }) => {
  const [newForm, setNewForm] = useState<boolean>(false);
  return (
    <>
      {newForm ? (
        <CVForm
          user={user}
          division={division}
          socket={socket}
          onSubmit={() => setNewForm(false)}
        />
      ) : (
        <>
          <Grid container spacing={2}>
            {cvForms.map(form => (
              <Grid xs={6} key={form._id.toString()}>
                <CVFormCard division={division} form={form} />
              </Grid>
            ))}
          </Grid>
          <Stack alignItems="center" mt={2}>
            <Button
              startIcon={<AddIcon />}
              onClick={() => setNewForm(true)}
              variant="contained"
              size="large"
            >
              יצירת טופס CV חדש
            </Button>
          </Stack>
        </>
      )}
    </>
  );
};

export default CVPanel;
