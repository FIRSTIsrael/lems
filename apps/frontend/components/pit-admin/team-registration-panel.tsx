import { WithId } from 'mongodb';
import React, { useMemo, useState } from 'react';
import { Socket } from 'socket.io-client';
import { enqueueSnackbar } from 'notistack';
import { Paper, Button } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2/';
import { Event, Team, WSClientEmittedEvents, WSServerEmittedEvents } from '@lems/types';
import TeamSelection from '../general/team-selection';

interface TeamRegistrationPanelProps {
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
}

const TeamRegistrationPanel: React.FC<TeamRegistrationPanelProps> = ({ socket, event, teams }) => {
  const [team, setTeam] = useState<WithId<Team> | null>(null);

  const unregisteredTeams = useMemo(
    () => (teams ? teams.filter((team: WithId<Team>) => !team.registered) : []),
    [teams]
  );

  const registerTeam = () => {
    team &&
      socket.emit('registerTeam', event._id.toString(), team?._id.toString(), response => {
        if (response.ok) {
          enqueueSnackbar(`קבוצה #${team.number} נרשמה בהצלחה!`, { variant: 'success' });
          setTeam(null);
        }
      });
  };

  return (
    <Paper sx={{ p: 4 }}>
      <Grid container direction="row" alignItems="center" spacing={4}>
        <Grid xs={9}>
          <TeamSelection teams={unregisteredTeams} value={team} setTeam={setTeam} />
        </Grid>
        <Grid xs={3}>
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
