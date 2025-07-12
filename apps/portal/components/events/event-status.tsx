import dayjs from 'dayjs';
import { Paper, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { PortalEventStatus } from '@lems/types';
import LiveIcon from '../live-icon';
import { useTranslations } from 'next-intl';

interface EventStatusProps {
  status: PortalEventStatus;
}

const EventStatus: React.FC<EventStatusProps> = ({ status }) => {
  const t = useTranslations('components.events.event-status');

  const hasCurrentMatch = status.field.match.number > 0;
  const hasCurrentSession = status.judging.session.number > 0;

  return (
    <Paper sx={{ p: 2, my: 2, width: '100%' }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <Typography variant="h2" maxWidth="90%">
          {t('active-event')}
        </Typography>
        <LiveIcon />
      </Stack>
      <Grid container width="100%">
        <Grid size={{ xs: 12, md: 6 }}>
          {hasCurrentMatch ? (
            <>
              <Typography variant="h6">
                {t('current-match', { number: status.field.match.number })}
              </Typography>
              <Typography variant="h6">
                {t('current-match-time', { time: dayjs(status.field.match.time).format('HH:mm') })}
              </Typography>
            </>
          ) : (
            <Typography variant="h6">{t('all-matches-completed')}</Typography>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {hasCurrentSession ? (
            <>
              <Typography color="text.secondary" gutterBottom>
                {t('current-session', { number: status.judging.session.number })}
              </Typography>
              <Typography color="text.secondary" gutterBottom>
                {t('current-session-time', {
                  time: dayjs(status.judging.session.time).format('HH:mm')
                })}
              </Typography>
            </>
          ) : (
            <Typography variant="h6">{t('all-sessions-completed')}</Typography>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default EventStatus;
