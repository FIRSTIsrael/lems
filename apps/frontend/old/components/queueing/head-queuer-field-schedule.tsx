import dayjs from 'dayjs';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useMemo } from 'react';
import { Socket } from 'socket.io-client';
import {
  Team,
  RobotGameMatch,
  RobotGameTable,
  WSClientEmittedEvents,
  WSServerEmittedEvents,
  JudgingSession
} from '@lems/types';
import {
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Checkbox,
  Tooltip,
  Stack
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import StyledTeamTooltip from '../general/styled-team-tooltip';
import { useTime } from '../../hooks/time/use-time';

interface HeadQueuerFieldScheduleProps {
  divisionId: ObjectId;
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
  sessions: Array<WithId<JudgingSession>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const HeadQueuerFieldSchedule: React.FC<HeadQueuerFieldScheduleProps> = ({
  divisionId,
  teams,
  matches,
  tables,
  sessions,
  socket
}) => {
  const currentTime = useTime({ interval: 1000 * 30 });

  const callMatch = useCallback(
    (matchId: ObjectId, called: boolean) => {
      socket.emit(
        'updateMatchBrief',
        divisionId.toString(),
        matchId.toString(),
        { called },
        response => {
          if (!response.ok) {
            enqueueSnackbar('אופס, עדכון המקצה נכשל.', { variant: 'error' });
          }
        }
      );
    },
    [divisionId, socket]
  );

  const updateParticipantQueueStatus = useCallback(
    (match: WithId<RobotGameMatch>, teamId: ObjectId, newQueueStatus: boolean) => {
      socket.emit(
        'updateMatchParticipant',
        divisionId.toString(),
        match._id.toString(),
        {
          teamId: teamId.toString(),
          queued: newQueueStatus
        },
        response => {
          if (!response.ok) {
            enqueueSnackbar('אופס, עדכון המקצה נכשל.', { variant: 'error' });
          }
        }
      );
    },
    [socket, divisionId]
  );

  const availableMatches = useMemo(
    () =>
      matches.filter(
        match =>
          match.status === 'not-started' &&
          currentTime >= dayjs(match.scheduledTime).subtract(15, 'minutes')
      ),
    [matches, currentTime]
  );

  return (
    <TableContainer component={Paper} sx={{ py: 1 }}>
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
          {availableMatches.slice(0, 5).map(match => (
            <TableRow key={match.number} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
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
                          <Checkbox
                            checked={queued}
                            disabled={!team.registered}
                            onClick={e => {
                              e.preventDefault();
                              updateParticipantQueueStatus(match, team._id, !queued);
                            }}
                          />
                        ))}
                    </Stack>
                  </TableCell>
                );
              })}
              <TableCell sx={{ pl: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  color={match.called ? 'error' : 'primary'}
                  onClick={() => callMatch(match._id, !match.called)}
                >
                  {match.called ? 'ביטול' : 'קריאה'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HeadQueuerFieldSchedule;
