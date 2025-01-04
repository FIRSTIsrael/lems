import { JudgingSession, RobotGameMatch } from '@lems/types';
import { Box, Typography, Stack } from '@mui/material';
import Grid from '@mui/material/Grid2';
import dayjs from 'dayjs';
import StatusIcon from '../general/status-icon';

interface EventWidgetProps {
  eventType: 'match' | 'judging';
  event: RobotGameMatch | JudgingSession;
}

const EventWidget: React.FC<EventWidgetProps> = ({ eventType, event }) => {
  const eventName = eventType === 'match' ? 'מקצה' : 'חדר שיפוט';
  const eventTime = dayjs(event.scheduledTime).format('HH:mm');

  const colors = {
    'not-started': '#666',
    'in-progress': '#f57c00',
    completed: '#388e3c'
  };

  return (
    <Grid size={2}>
      <Box p={1} border={`2px solid ${colors[event.status]}`} borderRadius={1.5}>
        <Typography
          fontWeight={500}
        >{`${eventName} ${'round' in event ? event.round : ''}`}</Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography>{eventTime}</Typography>
          <StatusIcon status={event.status} />
        </Stack>
      </Box>
    </Grid>
  );
};

export default EventWidget;
