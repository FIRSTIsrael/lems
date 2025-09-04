import { PortalEvent } from '@lems/types';
import { Stack, Divider, Typography, StackProps, Box } from '@mui/material';
import EventLink from './event-link';

interface EventListProps extends StackProps {
  events: Array<PortalEvent>;
  emptyText: string;
  title?: string;
  includeDate?: boolean;
  id?: string;
}

const EventList: React.FC<EventListProps> = ({
  events,
  emptyText,
  title,
  includeDate = false,
  id
}) => {
  return (
    <Box pb={2}>
      {title && (
        <Typography variant="h2" gutterBottom>
          {title}
        </Typography>
      )}
      <Stack id={id} spacing={1} divider={<Divider flexItem variant="middle" />}>
        {events.length === 0 && (
          <Typography pl={1} variant="body1">
            {emptyText}
          </Typography>
        )}
        {events.map(event => (
          <EventLink key={event.id} event={event} includeDate={includeDate} />
        ))}
      </Stack>
    </Box>
  );
};

export default EventList;
