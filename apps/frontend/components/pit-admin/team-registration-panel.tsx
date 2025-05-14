import { WithId } from 'mongodb';
import React, { useMemo, useState } from 'react';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import { Paper, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Division,
  TeamRegistration,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import TeamSelection from '../general/team-selection';

interface TeamRegistrationPanelProps {
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  division: WithId<Division>;
  teams: Array<WithId<TeamRegistration>>;
}

const TeamRegistrationPanel: React.FC<TeamRegistrationPanelProps> = ({
  socket,
  division,
  teams
}) => {
  const [team, setTeam] = useState<WithId<TeamRegistration> | null>(null);

  const unregisteredTeams = useMemo(
    () => (teams ? teams.filter((team: WithId<TeamRegistration>) => !team.arrived) : []),
    [teams]
  );

  const registerTeam = () => {
    team &&
      socket.emit('registerTeam', division._id.toString(), team?._id.toString(), response => {
        if (response.ok) {
          enqueueSnackbar(`קבוצה #${team.number} נרשמה בהצלחה!`, { variant: 'success' });
          setTeam(null);
        }
      });
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Grid container direction="row" alignItems="center" spacing={4}>
        <Grid size={9}>
          <TeamSelection teams={unregisteredTeams} value={team} setTeam={setTeam} />
        </Grid>
        <Grid size={3}>
          <Button
            sx={{ borderRadius: 8 }}
            variant="contained"
            disabled={!team}
            fullWidth
            onClick={registerTeam}
          >
            הקבוצה הגיעה
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TeamRegistrationPanel;
