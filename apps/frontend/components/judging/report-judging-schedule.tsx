import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Division,
  JudgingSession,
  JudgingRoom,
  Team,
  DivisionScheduleEntry,
  JUDGING_SESSION_LENGTH
} from '@lems/types';
import StyledTeamTooltip from '../general/styled-team-tooltip';

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
  const rowSessions = sessions.filter(s => s.number === number);
  const startTime = dayjs(rowSessions[0].scheduledTime);
  const rowCompleted = rowSessions.every(s => s.status === 'completed');

  return (
    <TableRow sx={{ backgroundColor: rowCompleted ? '#f4f4f5' : undefined }}>
      <TableCell>{startTime.format('HH:mm')}</TableCell>
      <TableCell>{startTime.add(JUDGING_SESSION_LENGTH, 'seconds').format('HH:mm')}</TableCell>
      {rooms.map(room => {
        const session = sessions.find(s => s.number === number && s.roomId === room._id);
        const team = teams.find(t => t._id === session?.teamId);

        return (
          <TableCell
            key={room._id.toString()}
            align="center"
            sx={{ backgroundColor: session?.status === 'completed' ? '#f4f4f5' : undefined }}
          >
            {team && <StyledTeamTooltip team={team} />}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

interface GeneralScheduleRowProps {
  schedule: DivisionScheduleEntry;
  colSpan: number;
}

const GeneralScheduleRow: React.FC<GeneralScheduleRowProps> = ({ schedule, colSpan }) => {
  return (
    <TableRow>
      <TableCell>{dayjs(schedule.startTime).format('HH:mm')}</TableCell>
      <TableCell>{dayjs(schedule.endTime).format('HH:mm')}</TableCell>
      <TableCell colSpan={colSpan} sx={{ textAlign: 'center' }}>
        {schedule.name}
      </TableCell>
    </TableRow>
  );
};

interface ReportJudgingScheduleProps {
  division: WithId<Division>;
  rooms: Array<WithId<JudgingRoom>>;
  sessions: Array<WithId<JudgingSession>>;
  teams: Array<WithId<Team>>;
  showGeneralSchedule: boolean;
}

const ReportJudgingSchedule: React.FC<ReportJudgingScheduleProps> = ({
  division,
  rooms,
  sessions,
  teams,
  showGeneralSchedule = false
}) => {
  const judgesGeneralSchedule = division.schedule?.filter(s => s.roles.includes('judge')) || [];

  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
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
            const rowTime = dayjs(sessions.find(s => s.number === row)?.scheduledTime);
            const prevRowTime = dayjs(sessions.find(s => s.number === row - 1)?.scheduledTime);
            const rowGeneralSchedule =
              judgesGeneralSchedule.filter(
                p => dayjs(p.startTime).isBefore(rowTime) && dayjs(p.startTime).isAfter(prevRowTime)
              ) || [];

            return (
              <>
                {showGeneralSchedule &&
                  rowGeneralSchedule.map(rs => (
                    <GeneralScheduleRow key={rs.name} schedule={rs} colSpan={rooms.length} />
                  ))}
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
          {showGeneralSchedule &&
            judgesGeneralSchedule
              .filter(s => {
                const lastSession = Math.max(...sessions.flatMap(s => s.number));
                const lastSessionTime = dayjs(
                  sessions.find(s => s.number === lastSession)?.scheduledTime
                );

                return dayjs(s.startTime).isAfter(lastSessionTime);
              })
              .map(rs => <GeneralScheduleRow key={rs.name} schedule={rs} colSpan={rooms.length} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReportJudgingSchedule;
