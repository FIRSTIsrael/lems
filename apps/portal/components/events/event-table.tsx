import { PortalEvent } from '@lems/types';
import {
  Box,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableHead,
  Typography
} from '@mui/material';
import EventRow from './event-row';

interface EventTableProps {
  title?: string;
  events: PortalEvent[];
}

const EventTable: React.FC<EventTableProps> = ({ title, events }) => {
  return (
    <Box>
      {title && <Typography variant="h2">{title}</Typography>}
      {events.length === 0 && <Typography>אין אירועים</Typography>}
      {events.length > 0 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>אירוע</TableCell>
                <TableCell>תאריך</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map(event => (
                <EventRow key={event.id} event={event} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default EventTable;
