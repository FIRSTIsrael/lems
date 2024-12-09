import { useState } from 'react';
import { WithId } from 'mongodb';
import { Socket } from 'socket.io-client';
import { Stack, Button } from '@mui/material';
import Grid from '@mui/material/Grid2';
import AddRoundedIcon from '@mui/icons-material/Add';
import {
  SafeUser,
  CoreValuesForm,
  Division,
  WSClientEmittedEvents,
  WSServerEmittedEvents,
  Team
} from '@lems/types';
import CVFormCard from './cv-form-card';
import CVForm from './cv-form';

interface CVPanelProps {
  user: WithId<SafeUser>;
  teams: Array<WithId<Team>>;
  cvForms: Array<WithId<CoreValuesForm>>;
  division: WithId<Division>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const CVPanel: React.FC<CVPanelProps> = ({ user, teams, cvForms, division, socket }) => {
  const [newForm, setNewForm] = useState<boolean>(false);
  return (
    <>
      {newForm ? (
        <CVForm
          user={user}
          division={division}
          teams={teams.filter(team => team.registered)}
          socket={socket}
          onSubmit={() => setNewForm(false)}
        />
      ) : (
        <>
          <Grid container spacing={2}>
            {cvForms.map(form => (
              <Grid key={form._id.toString()} size={6}>
                <CVFormCard division={division} form={form} />
              </Grid>
            ))}
          </Grid>
          <Stack alignItems="center" mt={2}>
            <Button
              startIcon={<AddRoundedIcon />}
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
