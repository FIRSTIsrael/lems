import { useState, useEffect, useMemo } from 'react';
import { ObjectId, WithId } from 'mongodb';
import dayjs, { Dayjs } from 'dayjs';
import { Chip, Stack, Typography, Box, Button } from '@mui/material';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import NumbersRoundedIcon from '@mui/icons-material/NumbersRounded';
import {
  DivisionState,
  JudgingSession,
  RobotGameMatch,
  Team,
  JUDGING_SESSION_LENGTH,
  MATCH_LENGTH
} from '@lems/types';
import { getBackgroundColor } from '../../lib/utils/theme';
import RematchSelector from './rematch-selector';

interface TeamRematchSchedulerProps {
  team: WithId<Team>;
  teams: Array<WithId<Team>>;
  divisionState: WithId<DivisionState>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  onScheduleRematch: (
    team: WithId<Team>,
    match: WithId<RobotGameMatch>,
    participantIndex: number
  ) => void;
}

const TeamRematchScheduler: React.FC<TeamRematchSchedulerProps> = ({
  team,
  teams,
  divisionState,
  matches,
  sessions,
  onScheduleRematch
}) => {
  const [selectedMatch, setSelectedMatch] = useState<WithId<RobotGameMatch> | null>(null);
  useEffect(() => setSelectedMatch(null), [team.number]);

  const [selectedParticipant, setSelectedParticipant] = useState<number | null>(null);
  useEffect(() => setSelectedParticipant(null), [selectedMatch]);

  const beforeSelectedMatch = useMemo(() => {
    if (!selectedMatch) return null;
    const previous = matches.find(
      match =>
        match.stage === 'ranking' &&
        match.round === selectedMatch.round &&
        match.number === selectedMatch.number - 1
    );
    return previous ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMatch]);

  const afterSelectedMatch = useMemo(() => {
    if (!selectedMatch) return null;
    const next = matches.find(
      match =>
        match.stage === 'ranking' &&
        match.round === selectedMatch.round &&
        match.number === selectedMatch.number + 1
    );
    return next ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMatch]);

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

  const currentMatch = useMemo(() => {
    const loadedMatch = matches.find(match => match._id === divisionState.loadedMatch);
    const nextUnplayedMatch = matches
      .filter(
        match =>
          match.stage === 'ranking' &&
          match.round === divisionState.currentRound &&
          match.status === 'not-started'
      )
      .sort((a, b) => a.number - b.number)[0];
    return loadedMatch ?? nextUnplayedMatch;
  }, [matches, divisionState.loadedMatch, divisionState.currentRound]);

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
        <Chip label={`סבב נוכחי: ${divisionState.currentRound}`} icon={<NumbersRoundedIcon />} />
        <Chip label={`מקצה נוכחי: ${currentMatch.number}`} icon={<NumbersRoundedIcon />} />
      </Box>
      <Box display="flex" flexDirection="row" gap={1}>
        {availableMatches.length === 0 && (
          <Typography>
            {'לא נמצא זמן למקצה חוזר בסבב הנוכחי.'}
            <br />
            {'ניתן להריץ מקצה בדיקה ולנקד אותו בעזרת שופט הזירה הראשי.'}
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

      {selectedMatch && (
        <RematchSelector
          teams={teams}
          previousMatch={beforeSelectedMatch}
          match={selectedMatch}
          nextMatch={afterSelectedMatch}
          onSelect={participantIndex => setSelectedParticipant(participantIndex)}
        />
      )}

      {availableMatches.length > 0 && (
        <Stack direction="row" spacing={2} mt={2} alignItems="center">
          <Typography>
            {`תיאום מקצה חוזר לקבוצה #${team.number} `}
            {`בשעה ${selectedMatch ? dayjs(selectedMatch.scheduledTime).format('HH:mm') : ' _____ '} `}
            {`בשולחן ${selectedMatch && selectedParticipant ? selectedMatch.participants[selectedParticipant].tableName : ' _____ '}`}
          </Typography>
          <Button
            variant="contained"
            startIcon={<CheckRoundedIcon />}
            disabled={selectedMatch === null || selectedParticipant === null}
            onClick={() => {
              // Cannot be null since button is disabled when it's null
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              onScheduleRematch(team, selectedMatch!, selectedParticipant!);
              setSelectedMatch(null);
              setSelectedParticipant(null);
            }}
          >
            שמירה
          </Button>
        </Stack>
      )}
    </Stack>
  );
};

export default TeamRematchScheduler;
