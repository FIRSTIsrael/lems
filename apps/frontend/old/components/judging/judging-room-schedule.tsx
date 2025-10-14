import { WithId } from 'mongodb';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Socket } from 'socket.io-client';
import {
  Division,
  JudgingSession,
  JudgingRoom,
  Team,
  SafeUser,
  Rubric,
  JudgingCategory,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import RoomScheduleRow from './judging-room-schedule-row';

interface Props {
  division: WithId<Division>;
  sessions: Array<WithId<JudgingSession>>;
  room: WithId<JudgingRoom>;
  teams: Array<WithId<Team>>;
  user: WithId<SafeUser>;
  rubrics: Array<WithId<Rubric<JudgingCategory>>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const JudgingRoomSchedule = ({ division, sessions, room, teams, user, rubrics, socket }: Props) => {
  return (
    <TableContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">שעת התחלה</TableCell>
            <TableCell align="left">קבוצה</TableCell>
            <TableCell />
            <TableCell />
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {sessions.map(session => {
            const team = teams.find(team => team._id === session.teamId);
            return (
              team && (
                <RoomScheduleRow
                  key={String(session.teamId) + session.scheduledTime}
                  division={division}
                  team={team}
                  room={room}
                  session={session}
                  user={user}
                  rubrics={rubrics}
                  socket={socket}
                />
              )
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default JudgingRoomSchedule;
