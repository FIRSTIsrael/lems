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
  Team,
  MATCH_LENGTH,
  RobotGameMatch,
  RobotGameTable,
  RobotGameMatchStage,
  EventScheduleEntry
} from '@lems/types';
import StyledTeamTooltip from '../general/styled-team-tooltip';
import { localizedMatchStage } from '../../localization/field';

interface ReportMatchScheduleRowProps {
  match: WithId<RobotGameMatch>;
  tables: Array<WithId<RobotGameTable>>;
  teams: Array<WithId<Team>>;
}

const ReportMatchScheduleRow: React.FC<ReportMatchScheduleRowProps> = ({
  match,
  tables,
  teams
}) => {
  const startTime = dayjs(match.scheduledTime);

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell align="center">{match.number}</TableCell>
      <TableCell align="center">{startTime.format('HH:mm')}</TableCell>
      <TableCell align="center">{startTime.add(MATCH_LENGTH, 'seconds').format('HH:mm')}</TableCell>
      {tables.map(table => {
        const team = teams.find(
          t => t._id === match.participants.find(p => p.tableId === table._id)?.teamId
        );

        return (
          <TableCell key={table._id.toString()} align="center">
            {team && <StyledTeamTooltip team={team} />}
          </TableCell>
        );
      })}
    </TableRow>
  );
};

interface ReportRoundScheduleProps {
  roundStage: RobotGameMatchStage;
  roundNumber: number;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
  teams: Array<WithId<Team>>;
  eventSchedule: Array<EventScheduleEntry>;
}

const ReportRoundSchedule: React.FC<ReportRoundScheduleProps> = ({
  roundStage,
  roundNumber,
  matches,
  tables,
  teams,
  eventSchedule
}) => {
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell colSpan={3 + tables.length} align="center">
              סבב {localizedMatchStage[roundStage]} #{roundNumber}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">מקצה</TableCell>
            <TableCell align="center">התחלה</TableCell>
            <TableCell align="center">סיום</TableCell>
            {tables.map(table => (
              <TableCell key={table._id.toString()} align="center">
                {`שולחן ${table.name}`}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map(m => (
            <ReportMatchScheduleRow match={m} tables={tables} teams={teams} key={m.number} />
          ))}
          {eventSchedule
            .filter(c => {
              const timeDiff = dayjs(c.startTime).diff(
                matches[matches.length - 1].scheduledTime,
                'minutes'
              );
              return timeDiff > 0 && timeDiff <= 15;
            })
            .map((c, index) => (
              <TableRow key={c.name + index}>
                <TableCell />
                <TableCell align="center">{dayjs(c.startTime).format('HH:mm')}</TableCell>
                <TableCell align="center">{dayjs(c.endTime).format('HH:mm')}</TableCell>
                <TableCell colSpan={tables.length} align="center">
                  {c.name}
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReportRoundSchedule;
