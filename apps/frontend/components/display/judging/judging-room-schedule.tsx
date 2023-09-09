import { WithId } from 'mongodb';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Socket } from 'socket.io-client';
import {
  Event,
  JudgingSession,
  JudgingRoom,
  Team,
  SafeUser,
  JudgingClientEmittedEvents,
  JudgingServerEmittedEvents
} from '@lems/types';
import RoomScheduleRow from './judging-room-schedule-row';

interface Props {
  event: WithId<Event>;
  sessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
  user: SafeUser;
  socket: Socket<JudgingServerEmittedEvents, JudgingClientEmittedEvents>;
}

const JudgingRoomSchedule = ({ event, sessions, rooms, teams, user, socket }: Props) => {
  return (
    <TableContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">שעת התחלה</TableCell>
            <TableCell align="right">קבוצה</TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map(session => {
            const team = teams.find(team => team._id === session.team);
            const room = rooms.find(room => room._id === session.room);
            return (
              <RoomScheduleRow
                key={String(session.team) + session.time}
                event={event}
                team={team ? team : ({} as Team)}
                room={room ? room : ({} as WithId<JudgingRoom>)}
                session={session}
                user={user}
                socket={socket}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default JudgingRoomSchedule;
