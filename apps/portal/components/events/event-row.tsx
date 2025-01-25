import React from 'react';
import dayjs from 'dayjs';
import { PortalEvent } from '@lems/types';
import { TableCell, TableRow, Typography } from '@mui/material';

interface EventRowProps {
  event: PortalEvent;
}

const EventRow: React.FC<EventRowProps> = ({ event }) => {
  return (
    <TableRow>
      <TableCell>
        <Typography>{event.name}</Typography>
      </TableCell>
      <TableCell>
        <Typography>{dayjs(event.date).format('D בMMMM YYYY')}</Typography>
      </TableCell>
    </TableRow>
  );
};

export default EventRow;
