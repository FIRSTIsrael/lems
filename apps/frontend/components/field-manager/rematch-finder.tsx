import { WithId } from 'mongodb';
import { useState } from 'react';
import dayjs from 'dayjs';
import { Stack, Paper, Typography } from '@mui/material';
import {
  DivisionState,
  JUDGING_SESSION_LENGTH,
  JudgingSession,
  RobotGameMatch,
  Team
} from '@lems/types';
import TeamSelection from '../general/team-selection';

interface RematchOptionsProps {
  teams: Array<WithId<Team>>;
  rematchTeam: WithId<Team>;
  divisionState: WithId<DivisionState>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
}

const RematchOptions: React.FC<RematchOptionsProps> = ({
  teams,
  rematchTeam,
  divisionState,
  matches,
  sessions
}) => {
  const unregisteredTeamIds = teams.filter(t => !t.registered).map(t => t._id);

  const judgingTime = sessions.find(session => session.teamId === rematchTeam._id)?.scheduledTime;
  const earliestRematchTime = dayjs(judgingTime).add(JUDGING_SESSION_LENGTH + 10 * 60, 'seconds'); // 10 minutes after judging ends
  const latestRematchTime = dayjs(judgingTime).subtract(15, 'minutes'); // 15 minutes before judging starts

  const teamMatchTimes = matches
    .filter(match => !!match.participants.find(p => p.teamId === rematchTeam._id))
    .map(match => dayjs(match.scheduledTime));

  const availableMatches = matches.filter(
    match =>
      match.stage === 'ranking' &&
      match.round === divisionState.currentRound &&
      match.status === 'not-started' &&
      !match.participants.find(p => p.teamId === rematchTeam._id) &&
      dayjs(match.scheduledTime).isAfter(earliestRematchTime) &&
      dayjs(match.scheduledTime).isBefore(latestRematchTime)
  );

  // Judging sessions that are available for the rematch team to swap into
  // without causing conflicts with their matches
  const availableJudgingSlots = sessions.filter(
    session =>
      (session.teamId === null || unregisteredTeamIds.includes(session.teamId)) &&
      !teamMatchTimes.find(
        time =>
          time.isBefore(
            dayjs(session.scheduledTime).add(JUDGING_SESSION_LENGTH + 10 * 60, 'seconds')
          ) && // Session end + 10 mins is after the scheduled time -> team will not make it to match
          time.isAfter(dayjs(session.scheduledTime).subtract(15, 'minutes')) // Session starts less than 15 minutes after the match -> team will not make it to session
      )
  );

  // 1. Calculate all tables in relevant matches that contain unregiereed teams (or null teams)
  // TODO: deal with match staggering here

  // 2. Null teams that can swap if the teams judging moves to another null spot, or unregistered teams that can swap both their judging and field sessions

  // 3. Registered teams who can swap with the team without judging interference (but obviously need to notify them, make a popup to warn

  return (
    <Paper sx={{ p: 2 }}>
      {availableMatches.length}
      <br />
      {judgingTime?.toString()}
    </Paper>
  );
};

interface RematchFinderProps {
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  divisionState: WithId<DivisionState>;
}

const RematchFinder: React.FC<RematchFinderProps> = ({
  teams,
  matches,
  sessions,
  divisionState
}) => {
  const [rematchTeam, setRematchTeam] = useState<WithId<Team> | null>(null);

  if (divisionState.currentStage !== 'ranking') {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Typography variant="h2" gutterBottom>
          הענקת מקצה חוזר
        </Typography>
        <Typography>לא ניתן להעניק מקצה חוזר בשלב האימונים.</Typography>
      </Paper>
    );
  }

  return (
    <Stack sx={{ mt: 2 }} spacing={2}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h2" gutterBottom>
          הענקת מקצה חוזר
        </Typography>
        <TeamSelection setTeam={setRematchTeam} teams={teams} value={rematchTeam} />
      </Paper>
      {rematchTeam && (
        <RematchOptions
          teams={teams}
          rematchTeam={rematchTeam}
          divisionState={divisionState}
          matches={matches}
          sessions={sessions}
        />
      )}
    </Stack>
  );
};

export default RematchFinder;
