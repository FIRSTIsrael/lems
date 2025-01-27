import { PortalEvent } from '@lems/types';
import { Stack, Divider, Typography, StackProps } from '@mui/material';
import EventLink from './event-link';

interface EventListProps extends StackProps {
  events: Array<PortalEvent>;
  emptyText: string;
  title?: string;
  includeDate?: boolean;
}

const EventList: React.FC<EventListProps> = ({ events, emptyText, title, includeDate = false }) => {
  return (
    <>
      {title && <Typography variant="h2">{title}</Typography>}
      <Stack spacing={1} divider={<Divider flexItem variant="middle" />}>
        {events.length === 0 && (
          <Typography pl={1} variant="body1">
            {emptyText}
          </Typography>
        )}
        {events.map(event => (
          <EventLink key={event.id} event={event} includeDate={includeDate} />
        ))}
      </Stack>
    </>
  );
};

export default EventList;
