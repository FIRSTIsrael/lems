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
  Stack,
  Typography
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
  extendedTeamInfo?: boolean;
}

const ReportMatchScheduleRow: React.FC<ReportMatchScheduleRowProps> = ({
  match,
  tables,
  teams,
  extendedTeamInfo = false
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
            {team &&
              (extendedTeamInfo ? (
                <Stack>
                  <Typography
                    fontWeight={500}
                  >{`${team.registered ? '' : '🚫 '}${team.name} #${team.number}`}</Typography>
                  <Typography color="text.secondary" fontSize="0.875rem" fontWeight={500}>
                    {team.affiliation.name}
                  </Typography>
                  <Typography color="text.secondary" fontSize="0.875rem" fontWeight={500}>
                    {team.affiliation.city}
                  </Typography>
                </Stack>
              ) : (
                <StyledTeamTooltip team={team} />
              ))}
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
  divisionSchedule: Array<EventScheduleEntry>;
  extendedTeamInfo?: boolean;
}

const ReportRoundSchedule: React.FC<ReportRoundScheduleProps> = ({
  roundStage,
  roundNumber,
  matches,
  tables,
  teams,
  divisionSchedule,
  extendedTeamInfo = false
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
            <ReportMatchScheduleRow
              match={m}
              tables={tables}
              teams={teams}
              extendedTeamInfo={extendedTeamInfo}
              key={m.number}
            />
          ))}
          {divisionSchedule
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
