import { RobotGameMatch, WSClientEmittedEvents, WSServerEmittedEvents } from '@lems/types';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button
} from '@mui/material';
import { localizedMatchStatus } from '../../../localization/field';
import dayjs from 'dayjs';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface ScheduleProps {
  eventId: string;
  matches: Array<WithId<RobotGameMatch>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const Schedule: React.FC<ScheduleProps> = ({ eventId, matches, socket }) => {
  const loadMatch = useCallback(
    (matchId: ObjectId) => {
      socket.emit('loadMatch', eventId, matchId.toString(), response => {
        if (!response.ok) {
          enqueueSnackbar('אופס, טעינת המקצה נכשלה.', { variant: 'error' });
        }
      });
    },
    [eventId, socket]
  );

  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>מקצה</TableCell>
            <TableCell>זמן</TableCell>
            <TableCell>סטטוס</TableCell>
            <TableCell>קבוצות</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map(match => (
            <TableRow key={match.number} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {match.number}
              </TableCell>
              <TableCell>{dayjs(match.scheduledTime).format('HH:mm')}</TableCell>
              <TableCell>{localizedMatchStatus[match.status]}</TableCell>
              <TableCell>
                {match.participants
                  .map(({ team, tableName }) => `${tableName} - #${team?.number}`)
                  .join(', ')}
              </TableCell>
              <TableCell sx={{ p: 0 }}>
                <Button
                  variant="contained"
                  color="inherit"
                  size="small"
                  onClick={() => loadMatch(match._id)}
                >
                  טעינה
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Schedule;
