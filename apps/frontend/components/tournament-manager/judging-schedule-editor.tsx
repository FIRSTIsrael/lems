import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import {
  Event,
  Team,
  JudgingRoom,
  SafeUser,
  JudgingSession,
  JUDGING_SESSION_LENGTH
} from '@lems/types';
import EditableTeamCell from './editable-team-cell';
interface JudgingScheduleRowProps {
  number: number;
  sessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
  teams: Array<WithId<Team>>;
}

const JudgingScheduleRow: React.FC<JudgingScheduleRowProps> = ({
  number,
  sessions,
  rooms,
  teams
}) => {
  const startTime = dayjs(sessions.find(s => s.number === number)?.scheduledTime);

  return (
    <TableRow>
      <TableCell>{startTime.format('HH:mm')}</TableCell>
      <TableCell>{startTime.add(JUDGING_SESSION_LENGTH, 'seconds').format('HH:mm')}</TableCell>
      {rooms.map(r => {
        const team = teams.find(
          t => t._id === sessions.find(s => s.number === number && s.room === r._id)?.team
        );

        return (
          <TableCell key={r._id.toString()} align="center">
            <EditableTeamCell teams={teams} initialTeam={team || null} />
          </TableCell>
        );
      })}
    </TableRow>
  );
};

interface JudgingScheduleEditorProps {
  teams: Array<WithId<Team>>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
}

const JudgingScheduleEditor: React.FC<JudgingScheduleEditorProps> = ({
  teams,
  rooms,
  sessions
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>התחלה</TableCell>
            <TableCell>סיום</TableCell>
            {rooms.map(room => (
              <TableCell key={room._id.toString()} align="center">
                {`חדר ${room.name}`}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[...new Set(sessions.flatMap(s => s.number))].map(row => {
            return (
              <>
                <JudgingScheduleRow
                  key={row}
                  number={row}
                  teams={teams}
                  sessions={sessions}
                  rooms={rooms}
                />
              </>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default JudgingScheduleEditor;
