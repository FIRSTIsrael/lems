import { useMemo , useCallback } from 'react';
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
import { Socket } from 'socket.io-client';
import StyledTeamTooltip from '../general/styled-team-tooltip';
import { useTime } from '../../hooks/time/use-time';

interface HeadQueuerJudgingScheduleProps {
  divisionId: ObjectId;
  teams: Array<WithId<Team>>;
  sessions: Array<WithId<JudgingSession>>;
  rooms: Array<WithId<JudgingRoom>>;
  matches: Array<WithId<RobotGameMatch>>;
  activeMatch: WithId<RobotGameMatch> | null;
  loadedMatch: WithId<RobotGameMatch> | null;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const HeadQueuerJudgingSchedule: React.FC<HeadQueuerJudgingScheduleProps> = ({
  divisionId,
  teams,
  sessions,
  rooms,
  matches,
  activeMatch,
  loadedMatch,
  socket
}) => {
  const currentTime = useTime({ interval: 1000 * 30 });

  const updateSession = useCallback(
    (sessionId: ObjectId, sessionData: Partial<Pick<JudgingSession, 'called' | 'queued'>>) => {
      socket.emit(
        'updateJudgingSession',
        divisionId.toString(),
        sessionId.toString(),
        sessionData,
        response => {
          if (!response.ok) {
            enqueueSnackbar('אופס, עדכון מפגש השיפוט נכשל.', { variant: 'error' });
          }
        }
      );
    },
    [divisionId, socket]
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

  const availableSessionGroups = useMemo(() => {
    const groups: Array<Array<WithId<JudgingSession>>> = Object.values(
      sessions.reduce((acc: any, session: JudgingSession) => {
        const sessionNumber = session.number;
        (acc[sessionNumber] = acc[sessionNumber] || []).push(session);
        return acc;
      }, {})
    );

    return groups
      .filter(group => group.length > 0)
      .filter(group => !group.some(session => session.status === 'completed'))
      .filter(group => group.some(session => session.status === 'not-started'))
      .filter(group => currentTime >= dayjs(group[0].scheduledTime).subtract(20, 'minutes'));
  }, [sessions, currentTime]);

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
          {availableSessionGroups.map((group, index) => {
            const firstSession = group[0];
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
                  const teamOnField =
                    !!activeMatch?.participants.find(p => p.teamId === team?._id) ||
                    !!loadedMatch?.participants.find(p => p.teamId === team?._id) ||
                    !!matches
                      .filter(m => m.called && m.status === 'not-started')
                      .some(m => m.participants.some(p => p.teamId === team?._id && p.queued));
                  return (
                    <TableCell key={room?.name || ''}>
                      <Stack spacing={1} alignItems="center" justifyContent="center">
                        {team && <StyledTeamTooltip team={team} />}
                        {team &&
                          session.called &&
                          (teamOnField ? (
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
