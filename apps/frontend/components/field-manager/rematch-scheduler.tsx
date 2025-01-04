import { useState, useEffect } from 'react';
import { ObjectId, WithId } from 'mongodb';
import dayjs, { Dayjs } from 'dayjs';
import { Socket } from 'socket.io-client';
import { Chip, Stack, Typography, Box } from '@mui/material';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import {
  DivisionState,
  JudgingSession,
  JudgingRoom,
  RobotGameMatch,
  Team,
  WSClientEmittedEvents,
  WSServerEmittedEvents,
  JUDGING_SESSION_LENGTH,
  MATCH_LENGTH
} from '@lems/types';
import { getBackgroundColor } from '../../lib/utils/theme';

interface RematchSchedulerProps {
  team: WithId<Team>;
  teams: Array<WithId<Team>>;
  divisionState: WithId<DivisionState>;
  rooms: Array<WithId<JudgingRoom>>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const RematchScheduler: React.FC<RematchSchedulerProps> = ({
  team,
  teams,
  divisionState,
  rooms,
  matches,
  sessions,
  socket
}) => {
  const [selectedMatch, setSelectedMatch] = useState<WithId<RobotGameMatch> | null>(null);
  useEffect(() => setSelectedMatch(null), [team.number]);

  const teamSession = sessions.find(
    session => session.teamId === team._id && session.status !== 'completed'
  );
  const sessionStart = teamSession ? dayjs(teamSession.scheduledTime) : null;
  const sessionEnd = sessionStart ? sessionStart.add(JUDGING_SESSION_LENGTH, 'seconds') : null;

  const timeToSession = (time: Dayjs) => {
    const delta = sessionStart ? sessionStart.diff(time, 'minutes') : null;
    return delta !== null && delta >= 0 ? delta : null;
  };

  const timeFromSession = (time: Dayjs) => {
    const delta = sessionEnd ? time.diff(sessionEnd, 'minutes') : null;
    return delta !== null && delta >= 0 ? delta : null;
  };

  const closeToSession = (match: RobotGameMatch) => {
    const START_THRESHOLD = 20;
    const END_THRESHOLD = 10;
    const matchTime = dayjs(match.scheduledTime);
    const startDelta = timeToSession(matchTime) ?? START_THRESHOLD;
    const endDelta = timeFromSession(matchTime) ?? END_THRESHOLD;
    return startDelta < START_THRESHOLD || endDelta < END_THRESHOLD;
  };

  const overlappingSession = (match: RobotGameMatch) => {
    const matchStartTime = dayjs(match.scheduledTime);
    const startOverlap = sessionStart && matchStartTime.isBetween(sessionStart, sessionEnd);
    const matchEndTime = matchStartTime.add(MATCH_LENGTH, 'seconds');
    const endOverlap = sessionStart && matchEndTime.isBetween(sessionStart, sessionEnd);
    return startOverlap || endOverlap;
  };

  const teamMatches = matches
    .filter(match => match.stage === 'ranking')
    .map(match => ({
      match,
      participantIndex: match.participants.findIndex(p => p.teamId === team._id)
    }))
    .filter(({ participantIndex }) => participantIndex !== -1);

  const nextRound = divisionState.currentRound + 1;
  const nextMatch = teamMatches.find(({ match }) => match.round === nextRound);
  const nextMatchTime = nextMatch ? dayjs(nextMatch.match.scheduledTime) : null;

  const isTeamRegistered = (teamId: ObjectId) =>
    !!teams.find(team => team._id === teamId)?.registered;

  const hasEmptyTable = (match: RobotGameMatch) =>
    match.participants.some(
      participant => !participant.teamId || !isTeamRegistered(participant.teamId)
    );

  /**
   * All matches in current round that have not been played yet,
   * and contain an empty table or unregistered team.
   */
  const availableMatches = matches.filter(
    match =>
      match.stage === 'ranking' &&
      match.round === divisionState.currentRound &&
      match._id !== divisionState.loadedMatch &&
      match.status === 'not-started' &&
      hasEmptyTable(match) &&
      !overlappingSession(match)
  );

  return (
    <Stack sx={{ py: 2 }}>
      <Box display="flex" flexDirection="row" gap={2} mb={2}>
        <Chip
          label={`חדר שיפוט: ${sessionStart ? sessionStart.format('HH:mm') : 'הסתיים'}`}
          icon={<GavelRoundedIcon />}
        />
        <Chip
          label={`מקצה הבא: ${nextMatchTime ? nextMatchTime.format('HH:mm') : '-'}`}
          icon={<SportsScoreIcon />}
        />
      </Box>
      <Box display="flex" flexDirection="row" gap={1}>
        {availableMatches.length === 0 && (
          <Typography>
            {'לא נמצא זמן למקצה חוזר בסבב הנוכחי.'}
            <br />
            {'ניתן להריץ מקצה בדיקה ונקד אותו בעזרת שופט הזירה הראשי.'}
          </Typography>
        )}
        {availableMatches.map((match, index) => {
          const bgColor = closeToSession(match)
            ? getBackgroundColor('#fd7036', 'light')
            : undefined;
          const hoverBgColor = closeToSession(match)
            ? getBackgroundColor('#ff4a00', 'main')
            : undefined;

          return (
            <Chip
              key={index}
              label={dayjs(match.scheduledTime).format('HH:mm')}
              sx={{ bgcolor: bgColor, '&:hover': { backgroundColor: hoverBgColor } }}
              onClick={() => setSelectedMatch(match)}
            />
          );
        })}
      </Box>

      <br />

      {selectedMatch && (
        <Typography>{dayjs(selectedMatch?.scheduledTime).format('HH:mm')}</Typography>
      )}

      <Typography>כשבוחרים כפתור יהיה פה לוז של לפני בזמן אחרי של המקצה</Typography>
      <Typography>בלוז עצמו, לחיצה על שולחן תסמן אותו</Typography>
      <Typography> לבסוף, יהיה כתוב המשפט "קביעת מקצה חוזר בשעה X בשולחן Y"</Typography>
      <Typography>וכפתור אישור סופי שיאפס את כל הUI</Typography>
    </Stack>
  );
};

export default RematchScheduler;
