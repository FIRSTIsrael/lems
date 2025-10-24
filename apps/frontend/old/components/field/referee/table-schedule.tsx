import { WithId } from 'mongodb';
import dayjs from 'dayjs';
import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import {
  Team,
  RobotGameMatch,
  RobotGameTable,
  RobotGameMatchStages,
  MATCH_LENGTH
} from '@lems/types';
import React from 'react';
import { localizedMatchStage } from '../../../localization/field';
import StyledTeamTooltip from '../../general/styled-team-tooltip';

interface TableScheduleRowProps {
  match: WithId<RobotGameMatch>;
  team: WithId<Team> | undefined;
  extendedTeamInfo?: boolean;
}

export const TableScheduleRow: React.FC<TableScheduleRowProps> = ({
  match,
  team,
  extendedTeamInfo = false
}) => {
  const startTime = dayjs(match.scheduledTime);

  return (
    <TableRow>
      <TableCell align="center">
        {localizedMatchStage[match.stage]} #{match.round}
      </TableCell>
      <TableCell align="center">{match.number}</TableCell>
      <TableCell align="center">{startTime.format('HH:mm')}</TableCell>
      <TableCell align="center">{startTime.add(MATCH_LENGTH, 'seconds').format('HH:mm')}</TableCell>
      <TableCell align="center">
        {team &&
          (extendedTeamInfo ? (
            <Stack>
              <Typography
                fontWeight={500}
              >{`${team.registered ? '' : '🚫 '}${team.name} #${team.number}`}</Typography>
              <Typography color="textSecondary" fontSize="0.875rem" fontWeight={500}>
                {team.affiliation.name}
              </Typography>
              <Typography color="textSecondary" fontSize="0.875rem" fontWeight={500}>
                {team.affiliation.city}
              </Typography>
            </Stack>
          ) : (
            <StyledTeamTooltip team={team} />
          ))}
      </TableCell>
    </TableRow>
  );
};

const BreakRow: React.FC = () => {
  return (
    <TableRow sx={{ backgroundColor: '#f4f4f5' }}>
      <TableCell colSpan={5} align="center">
        הפסקה
      </TableCell>
    </TableRow>
  );
};

interface TableScheduleProps {
  matches: Array<WithId<RobotGameMatch>>;
  table: WithId<RobotGameTable>;
  teams: Array<WithId<Team>>;
  limit?: number;
  extendedTeamInfo?: boolean;
}

const TableSchedule: React.FC<TableScheduleProps> = ({
  matches,
  table,
  teams,
  limit,
  extendedTeamInfo = false
}) => {
  const upcomingTableMatches = matches
    .filter(
      match =>
        match.participants.find(p => p.tableId === table._id)?.teamId !== null &&
        match.status !== 'completed'
    )
    .slice(0, limit)
    .sort(match => match.round)
    .sort(match => RobotGameMatchStages.indexOf(match.stage));

  const displayedTableRows = upcomingTableMatches.reduce(
    (result: Array<React.ReactElement<any>>, currentMatch, currentMatchIndex) => {
      if (
        currentMatchIndex > 0 &&
        dayjs(currentMatch.scheduledTime)
          .add(MATCH_LENGTH)
          .diff(dayjs(upcomingTableMatches[currentMatchIndex - 1].scheduledTime), 'minutes') > 15
      ) {
        result.push(<BreakRow />);
      }
      result.push(
        <TableScheduleRow
          match={currentMatch}
          team={teams.find(
            team =>
              team._id === currentMatch.participants.find(p => p.tableId === table._id)?.teamId
          )}
          extendedTeamInfo={extendedTeamInfo}
          key={currentMatch.number}
        />
      );
      return result;
    },
    []
  );

  return (
    <TableContainer component={Paper} elevation={3}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell colSpan={5} align="center">
              {`שולחן ${table.name}`}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell align="center">סבב</TableCell>
            <TableCell align="center">מקצה</TableCell>
            <TableCell align="center">התחלה</TableCell>
            <TableCell align="center">סיום</TableCell>
            <TableCell align="center">קבוצה</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {...displayedTableRows.slice(0, limit)}
          {limit && displayedTableRows.length > limit && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                ···
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableSchedule;
