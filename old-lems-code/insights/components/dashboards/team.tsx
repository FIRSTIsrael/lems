import { useState } from 'react';
import { WithId } from 'mongodb';
import { Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { Division, Team } from '@lems/types';
import TeamSelection from '../../general/team-selection';
import TeamProfileChart from '../charts/team-profile-chart';
import TeamInformationChart from '../charts/team-informaton-chart';

interface TeamInsightsDashboardProps {
  division: WithId<Division>;
  teams: Array<WithId<Team>>;
}

const TeamInsightsDashboard: React.FC<TeamInsightsDashboardProps> = ({ division, teams }) => {
  const [team, setTeam] = useState<WithId<Team> | null>(teams.filter(t => t.registered)[0]);

  return (
    <Paper sx={{ p: 2 }}>
      <Grid container direction="row" alignItems="center" spacing={4}>
        <Grid size={3}>
          <Typography textAlign="center" fontSize="1.125rem" fontWeight={600}>
            ניתוח קבוצה
          </Typography>
        </Grid>
        <Grid size={9}>
          <TeamSelection teams={teams.filter(t => t.registered)} value={team} setTeam={setTeam} />
        </Grid>
        <Grid size={6}>
          <TeamProfileChart division={division} team={team} />
        </Grid>
        <Grid size={6}>
          <TeamInformationChart division={division} team={team} />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TeamInsightsDashboard;
