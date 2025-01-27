import router from 'next/router';
import dayjs from 'dayjs';
import { Button, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { PortalEvent } from '@lems/types';

interface EventLinkProps {
  event: PortalEvent;
  includeDate?: boolean;
}

const EventLink: React.FC<EventLinkProps> = ({ event, includeDate = false }) => {
  return (
    <Button
      key={event.id}
      sx={{
        color: 'inherit',
        justifyContent: 'space-between',
        textAlign: 'left',
        '& .MuiButton-endIcon svg': { fontSize: 30 }
      }}
      endIcon={<ChevronLeftIcon />}
      fullWidth
      size="small"
      onClick={() => router.push(`/events/${event.id}`)}
    >
      <span>
        <Typography variant="h4">{event.name}</Typography>
        <Typography variant="body1" color="text.secondary">
          📍 {event.location}
        </Typography>
        {includeDate && (
          <Typography variant="body1" color="text.secondary">
            📅 {dayjs(event.date).format('DD/MM/YYYY')}
          </Typography>
        )}
      </span>
    </Button>
  );
};

export default EventLink;
