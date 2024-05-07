import dayjs from 'dayjs';
import { ObjectId, WithId } from 'mongodb';
import { Team, RobotGameMatch, RobotGameTable, JudgingSession } from '@lems/types';
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  Tooltip,
  Stack,
  Typography
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import StyledTeamTooltip from '../general/styled-team-tooltip';

interface FieldQueueReportProps {
  divisionId: ObjectId;
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
  sessions: Array<WithId<JudgingSession>>;
}

const FieldQueueReport: React.FC<FieldQueueReportProps> = ({
  divisionId,
  teams,
  matches,
  tables,
  sessions
}) => {
  return (
    <TableContainer component={Paper} sx={{ py: 1 }}>
      <Typography component="h2" fontSize="1.125rem" fontWeight={500} sx={{ px: 2 }} gutterBottom>
        מצב הקיו
      </Typography>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">מקצה</TableCell>
            <TableCell>זמן</TableCell>
            {tables.map(t => (
              <TableCell key={t._id.toString()} align="center">
                {t.name}
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {matches
            .filter(m => m.status === 'not-started' && m.called)
            .map(match => (
              <TableRow
                key={match.number}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row" align="center">
                  {match.number}
                </TableCell>
                <TableCell align="center">{dayjs(match.scheduledTime).format('HH:mm')}</TableCell>
                {match.participants.map(({ teamId, tableName, queued }) => {
                  const team = teamId ? teams.find(t => t._id == teamId) : undefined;
                  const teamInJudging = sessions
                    .filter(
                      s =>
                        s.status === 'in-progress' ||
                        (s.status === 'not-started' && s.called && s.queued)
                    )
                    .find(s => s.teamId === teamId);
                  return (
                    <TableCell key={tableName} align="center">
                      <Stack spacing={1} alignItems="center" justifyContent="center">
                        {team && <StyledTeamTooltip team={team} />}
                        {team &&
                          match.called &&
                          (teamInJudging ? (
                            <Tooltip title="הקבוצה נמצאת בחדר השיפוט כרגע!" arrow>
                              <WarningAmberRoundedIcon color="warning" />
                            </Tooltip>
                          ) : (
                            <Checkbox checked={queued} disabled={!team.registered} readOnly />
                          ))}
                      </Stack>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FieldQueueReport;
