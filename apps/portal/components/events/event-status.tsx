import dayjs from 'dayjs';
import { Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { PortalEvent, PortalEventStatus } from '@lems/types';
import LiveIcon from '../live-icon';

interface EventStatusProps {
  event: PortalEvent;
  status: PortalEventStatus;
}

const EventStatus: React.FC<EventStatusProps> = ({ event, status }) => {
  const hasCurrentMatch = status.field.match.number > 0;
  const hasCurrentSession = status.judging.session.number > 0;

  return (
    <Paper sx={{ p: 2, my: 2, width: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <Typography variant="h2" maxWidth="90%">
          אירוע פעיל
        </Typography>
        <LiveIcon />
      </Stack>
      <Grid container width="100%">
        <Grid size={{ xs: 12, md: 6 }}>
          {hasCurrentMatch ? (
            <>
              <Typography variant="h6">מקצה נוכחי - מקצה #{status.field.match.number}</Typography>
              <Typography color="text.secondary" gutterBottom>
                זמן מתוכנן: {dayjs(status.field.match.time).format('HH:mm')}
              </Typography>
            </>
          ) : (
            <Typography variant="h6">כל המקצים הושלמו</Typography>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {hasCurrentSession ? (
            <>
              <Typography variant="h6">
                סבב שיפוט נוכחי - סבב #{status.judging.session.number}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                זמן מתוכנן: {dayjs(status.judging.session.time).format('HH:mm')}
              </Typography>
            </>
          ) : (
            <Typography variant="h6">כל סבבי השיפוט הושלמו</Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EventStatus;
