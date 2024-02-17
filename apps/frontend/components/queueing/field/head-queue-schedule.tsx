import {
  Team,
  EventState,
  RobotGameMatch,
  RobotGameTable,
  WSClientEmittedEvents,
  WSServerEmittedEvents
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
  Checkbox
} from '@mui/material';
import dayjs from 'dayjs';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import StyledTeamTooltip from '../../general/styled-team-tooltip';

interface HeadQueueScheduleProps {
  eventId: ObjectId;
  eventState: WithId<EventState>;
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
  tables: Array<WithId<RobotGameTable>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const HeadQueueSchedule: React.FC<HeadQueueScheduleProps> = ({
  eventId,
  eventState,
  teams,
  matches,
  tables,
  socket
}) => {
  const callMatch = useCallback(
    (matchId: ObjectId, called: boolean) => {
      socket.emit(
        'updateMatchBrief',
        eventId.toString(),
        matchId.toString(),
        { called },
        response => {
          if (!response.ok) {
            enqueueSnackbar('אופס, עדכון המקצה נכשל.', { variant: 'error' });
          }
        }
      );
    },
    [eventId, socket]
  );

  const updateParticipantQueueStatus = useCallback(
    (match: WithId<RobotGameMatch>, teamId: ObjectId, newQueueStatus: boolean) => {
      socket.emit(
        'updateMatchParticipant',
        eventId.toString(),
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
    [socket, eventId]
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
          {matches
            .filter(
              m =>
                m.status === 'not-started' &&
                dayjs() >= dayjs(m.scheduledTime).subtract(15, 'minutes')
            )
            .slice(0, 5)
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
                  return (
                    <TableCell key={tableName} align="center">
                      {team && <StyledTeamTooltip team={team} />}
                      {team && match.called && (
                        <Checkbox
                          checked={queued}
                          disabled={!team.registered}
                          onClick={e => {
                            e.preventDefault();
                            updateParticipantQueueStatus(match, team._id, !queued);
                          }}
                        />
                      )}
                    </TableCell>
                  );
                })}
                <TableCell sx={{ pl: 1 }}>
                  <Button
                    variant="contained"
                    size="small"
                    color={match.called ? 'error' : 'primary'}
                    onClick={() => callMatch(match._id, !match.called)}
                    disabled={match.status === 'completed'}
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

export default HeadQueueSchedule;
