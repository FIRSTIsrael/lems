import { useMemo } from 'react';
import {
  Team,
  WSClientEmittedEvents,
  WSServerEmittedEvents,
  JudgingRoom,
  JudgingSession,
  RobotGameMatch
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
import dayjs from 'dayjs';
import { ObjectId, WithId } from 'mongodb';
import { enqueueSnackbar } from 'notistack';
import { useCallback } from 'react';
import { Socket } from 'socket.io-client';
import StyledTeamTooltip from '../general/styled-team-tooltip';
import { useTime } from '../../hooks/use-time';

interface HeadQueuerFieldScheduleProps {
  eventId: ObjectId;
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
  activeMatch: WithId<RobotGameMatch> | null;
  loadedMatch: WithId<RobotGameMatch> | null;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const HeadQueuerJudgingSchedule: React.FC<HeadQueuerFieldScheduleProps> = ({
  eventId,
  teams,
  sessions,
  rooms,
  activeMatch,
  loadedMatch,
  socket
}) => {
  const currentTime = useTime({ interval: 1000 * 30 });

  const updateSession = useCallback(
    (sessionId: ObjectId, sessionData: Partial<Pick<JudgingSession, 'called' | 'queued'>>) => {
      socket.emit(
        'updateJudgingSession',
        eventId.toString(),
        sessionId.toString(),
        sessionData,
        response => {
          if (!response.ok) {
            enqueueSnackbar('אופס, עדכון מפגש השיפוט נכשל.', { variant: 'error' });
          }
        }
      );
    },
    [eventId, socket]
  );

  const callSessions = useCallback(
    (sessionNumber: number, called: boolean) => {
      const sessionsToCall = sessions.filter(s => s.number === sessionNumber);
      sessionsToCall.forEach(s => updateSession(s._id, { called }));
    },
    [sessions, updateSession]
  );

  const updateTeamQueueStatus = useCallback(
    (sessionId: ObjectId, queued: boolean) => {
      updateSession(sessionId, { queued });
    },
    [updateSession]
  );

  const groupedSessions: Array<Array<WithId<JudgingSession>>> = useMemo(
    () =>
      Object.values(
        sessions.reduce((acc: any, session: JudgingSession) => {
          const sessionNumber = session.number;
          (acc[sessionNumber] = acc[sessionNumber] || []).push(session);
          return acc;
        }, {})
      ),
    [sessions]
  );

  return (
    <TableContainer component={Paper} sx={{ py: 1, my: 2 }}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="center">מקצה</TableCell>
            <TableCell>זמן</TableCell>
            {rooms.map(r => (
              <TableCell key={r._id.toString()} align="center">
                {r.name}
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {groupedSessions.map((group, index) => {
            if (group.length === 0) return <></>;
            const firstSession = group[0];
            if (
              firstSession.status !== 'not-started' ||
              currentTime <= dayjs(firstSession.scheduledTime).subtract(20, 'minutes')
            )
              return <></>;

            return (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row" align="center">
                  {firstSession.number}
                </TableCell>
                <TableCell align="center">
                  {dayjs(firstSession.scheduledTime).format('HH:mm')}
                </TableCell>
                {group.map(session => {
                  const team = session.teamId
                    ? teams.find(t => t._id === session.teamId)
                    : undefined;
                  const room = rooms.find(r => r._id === session.roomId);
                  const teamMatch =
                    activeMatch?.participants.find(p => p.teamId === team?._id) ||
                    loadedMatch?.participants.find(p => p.teamId === team?._id);
                  return (
                    <TableCell key={room?.name || ''}>
                      <Stack spacing={1} alignItems="center" justifyContent="center">
                        {team && <StyledTeamTooltip team={team} />}
                        {team &&
                          session.called &&
                          (teamMatch ? (
                            <Tooltip title="הקבוצה נמצאת בזירה כרגע!" arrow>
                              <WarningAmberRoundedIcon color="warning" />
                            </Tooltip>
                          ) : (
                            <Checkbox
                              checked={session.queued}
                              disabled={!team.registered}
                              onClick={e => {
                                e.preventDefault();
                                updateTeamQueueStatus(session._id, !session.queued);
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
                    color={firstSession.called ? 'error' : 'primary'}
                    onClick={() => callSessions(firstSession.number, !firstSession.called)}
                  >
                    {firstSession.called ? 'ביטול' : 'קריאה'}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default HeadQueuerJudgingSchedule;
