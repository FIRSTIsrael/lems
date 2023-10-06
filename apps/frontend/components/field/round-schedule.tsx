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
  RobotGameMatchType
} from '@lems/types';
import StyledTeamTooltip from '../../components/general/styled-team-tooltip';
import { localizedMatchType } from '../../localization/field';

interface MatchScheduleRowProps {
  match: WithId<RobotGameMatch>;
  tables: Array<WithId<RobotGameTable>>;
  teams: Array<WithId<Team>>;
}

const MatchScheduleRow: React.FC<MatchScheduleRowProps> = ({ match, tables, teams }) => {
  const startTime = dayjs(match.scheduledTime);

  return (
    <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
      <TableCell>{startTime.format('HH:mm')}</TableCell>
      <TableCell>{startTime.add(MATCH_LENGTH, 'seconds').format('HH:mm')}</TableCell>
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

interface RoundScheduleProps {
  roundType: RobotGameMatchType;
  roundNumber: number;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
  teams: Array<WithId<Team>>;
}

const RoundSchedule: React.FC<RoundScheduleProps> = ({
  roundType,
  roundNumber,
  matches,
  tables,
  teams
}) => {
  console.log(roundNumber);
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2 + tables.length} align="center">
              {localizedMatchType[roundType]} #{roundNumber}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>התחלה</TableCell>
            <TableCell>סיום</TableCell>
            {tables.map(table => (
              <TableCell key={table._id.toString()} align="center">
                {`שולחן ${table.name}`}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {matches.map(m => (
            <MatchScheduleRow match={m} tables={tables} teams={teams} key={m.number} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RoundSchedule;
