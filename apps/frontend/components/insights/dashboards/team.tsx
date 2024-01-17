import { useState } from 'react';
import { WithId } from 'mongodb';
import { Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Event, Team } from '@lems/types';
import TeamSelection from '../../general/team-selection';

interface TeamInsightsDashboardProps {
  event: WithId<Event>;
  teams: Array<WithId<Team>>;
}

const TeamInsightsDashboard: React.FC<TeamInsightsDashboardProps> = ({ event, teams }) => {
  const [team, setTeam] = useState<WithId<Team> | null>(null);

  return (
    <Paper sx={{ p: 2 }}>
      <Grid container direction="row" alignItems="center" spacing={2}>
        <Grid xs={3}>
          <Typography textAlign="center" fontSize="1.125rem" fontWeight={600}>
            ניתוח קבוצה
          </Typography>
        </Grid>
        <Grid xs={9}>
          <TeamSelection teams={teams} value={team} setTeam={setTeam} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TeamInsightsDashboard;
