import { Avatar, Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { PortalEvent, PortalTeam } from '@lems/types';

interface TeamInfoProps {
  team: PortalTeam;
  event: PortalEvent;
}

const TeamInfo: React.FC<TeamInfoProps> = ({ team, event }) => {
  return (
    <Paper sx={{ p: 2, flexGrow: 1 }}>
      <Grid container alignItems="center">
        <Grid size={4}>
          <Avatar
            src="/assets/default-avatar.svg"
            alt="לוגו קבוצתי"
            sx={{ width: 72, height: 72 }}
          />
        </Grid>
        <Grid size={8}>
          <Typography variant="h2">
            👥 {team.name} #{team.number}
          </Typography>
          <Typography variant="h6">
            🏫 {team.affiliation.name}, {team.affiliation.city}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            🎉 {event.name}
            {event.isDivision && ` - ${event.subtitle}`}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TeamInfo;
