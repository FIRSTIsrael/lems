import { TableCell, TableRow, Typography } from '@mui/material';
import dayjs from 'dayjs';
import type { AgendaEvent } from '../graphql/types';

interface AgendaEventRowProps {
  event: AgendaEvent;
  tableCount: number;
}

export const AgendaEventRow: React.FC<AgendaEventRowProps> = ({ event, tableCount }) => {
  const startTime = dayjs(event.start);
  const endTime = dayjs(event.end);

  return (
    <TableRow sx={{ backgroundColor: 'primary.light', opacity: 0.7 }}>
      <TableCell colSpan={3}>
        <Typography variant="body2" fontWeight={500}>
          {startTime.format('HH:mm')} - {endTime.format('HH:mm')}
        </Typography>
      </TableCell>
      <TableCell colSpan={tableCount}>
        <Typography variant="body2" fontWeight={500}>
          {event.title}
        </Typography>
      </TableCell>
    </TableRow>
  );
};
