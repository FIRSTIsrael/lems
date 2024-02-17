import {
  Team,
  EventState,
  RobotGameMatch,
  RobotGameTable,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Checkbox
} from '@mui/material';
import { red, grey } from '@mui/material/colors';
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
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>מקצה</TableCell>
            <TableCell>זמן</TableCell>
            {tables.map(t => (
              <TableCell key={t._id.toString()}>{t.name}</TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {matches
            .filter(m => m.status === 'not-started') // Perhaps filter this out by <15min start time like judge start button
            .slice(0, 5) // Alternatively - since the matches are sorted by time we can always allow only N matches that are not started
            .map(match => (
              <TableRow
                key={match.number}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {match.number}
                </TableCell>
                <TableCell>{dayjs(match.scheduledTime).format('HH:mm')}</TableCell>
                {match.participants.map(({ teamId, tableName, queued }) => {
                  const team = teamId ? teams.find(t => t._id == teamId) : undefined;
                  return (
                    <TableCell key={tableName}>
                      {team ? <StyledTeamTooltip team={team} /> : '-'}
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

                <TableCell sx={{ p: 0 }}>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ backgroundColor: match.called ? red[200] : grey[400] }}
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
