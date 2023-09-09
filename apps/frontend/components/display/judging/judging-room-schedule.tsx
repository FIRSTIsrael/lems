import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { WithId } from 'mongodb';
import { JudgingSession, JudgingRoom, Team, User } from '@lems/types';
import RoomScheduleRow from './judging-room-shcedule-row';

interface Props {
  sessions: JudgingSession[];
  rooms: WithId<JudgingRoom>[];
  teams: WithId<Team>[];
  user: User;
}

const RoomSchedule = ({ sessions, rooms, teams, user }: Props) => {
  return (
    <TableContainer>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">שעת התחלה</TableCell>
            <TableCell align="right">קבוצה</TableCell>
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
                team={team ? team : ({} as Team)}
                room={room ? room : ({} as JudgingRoom)}
                session={session}
                user={user}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RoomSchedule;
