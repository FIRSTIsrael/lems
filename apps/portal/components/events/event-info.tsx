import dayjs from 'dayjs';
import { Box, Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { PortalEvent } from '@lems/types';

interface EventInfoProps {
  event: PortalEvent;
  teamCount: number;
}

const EventInfo: React.FC<EventInfoProps> = ({ event, teamCount }) => {
  return (
    <Grid container component={Paper} sx={{ p: 2, my: 3, width: '100%' }}>
      <Grid size={12}>
        <Typography variant="h2" gutterBottom>
          מידע כללי
        </Typography>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Typography variant="body1">📅 {dayjs(event.date).format('DD/MM/YYYY')}</Typography>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Typography variant="body1">📍 {event.location}</Typography>
      </Grid>
      <Grid size={{ xs: 6, md: 3 }}>
        <Typography variant="body1">👥 {teamCount} קבוצות</Typography>
      </Grid>
    </Grid>
  );
};

export default EventInfo;
