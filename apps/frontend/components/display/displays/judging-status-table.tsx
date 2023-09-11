import { useMemo } from 'react';
import { WithId } from 'mongodb';
import {
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box
} from '@mui/material';
import { JudgingRoom, JudgingSession, Team, EventState } from '@lems/types';
import dayjs from 'dayjs';
import StatusIcon from '../status-icon';

interface Props {
  eventState: WithId<EventState>;
  sessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
}

const JudgingStatusTable: React.FC<Props> = ({ eventState, sessions, rooms, teams }) => {
  const activeSessions = useMemo(
    () => sessions.filter(session => session.number === eventState.activeSession),
    [sessions, eventState]
  );

  const nextSessions = useMemo(
    () => sessions.filter(session => session.number === eventState.activeSession + 1),
    [sessions, eventState]
  );

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell></TableCell>
            {rooms.map(room => (
              <TableCell key={room._id.toString()}>{room.name}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {activeSessions.length > 0 && (
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th">
                סבב נוכחי:
                <br />
                {dayjs(activeSessions[0].time).format('HH:mm')}
              </TableCell>
              {activeSessions.map(session => (
                <TableCell key={session._id.toString()}>
                  <Box alignItems="center">
                    {teams.find(t => t._id === session.team)?.name}
                    <br />
                    <StatusIcon status={session.status} />
                    <br />
                    {session.start && `שעת סיום: ${session.start}`}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          )}
          {nextSessions.length > 0 && (
            <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th">
                סבב הבא:
                <br />
                {dayjs(nextSessions[0].time).format('HH:mm')}
              </TableCell>
              {nextSessions.map(session => (
                <TableCell key={session._id.toString()}>
                  {teams.find(t => t._id === session.team)?.name}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default JudgingStatusTable;
