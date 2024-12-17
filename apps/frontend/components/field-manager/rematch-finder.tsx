import { WithId } from 'mongodb';
import { useState } from 'react';
import dayjs, { Dayjs } from 'dayjs';
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
  //TODO: DO SOMETHING HERE
  if (!judgingTime) console.error('No judging time found for team', rematchTeam.number);

  /**
   * Return true if:
   * Match starts less than 15 minutes before judging starts (Team won't make it to session)
   * AND Match starts less than 10 minutes after judging ends. (Team won't make it to match)
   */
  const judgingInterference = (judgingStart: Dayjs, ...matchStarts: Dayjs[]) => {
    const judgingEnd = judgingStart.add(JUDGING_SESSION_LENGTH, 'seconds');
    return matchStarts.some(
      matchStart =>
        matchStart.isAfter(judgingStart.subtract(15, 'minutes')) &&
        matchStart.isBefore(judgingEnd.add(10, 'minutes'))
    );
  };

  const teamMatchTimes = matches
    .filter(match => !!match.participants.find(p => p.teamId === rematchTeam._id))
    .map(match => dayjs(match.scheduledTime));

  /**
   * Matches containing at least one table with a null team or an unregistered team,
   * and the rematch team is not already participating in the match.
   */
  const availableMatches = matches.filter(
    match =>
      match.stage === 'ranking' &&
      match.round === divisionState.currentRound &&
      match.status === 'not-started' &&
      !match.participants.find(p => p.teamId === rematchTeam._id) &&
      match.participants.find(p => p.teamId === null || unregisteredTeamIds.includes(p.teamId))
  );

  /**
   * Judging sessions that have a null or unregistered team,
   * and do not interfere with the rematch team's matches.
   */
  const availableJudgingSlots = sessions.filter(
    session =>
      (session.teamId === null || unregisteredTeamIds.includes(session.teamId)) &&
      !judgingInterference(dayjs(judgingTime), ...teamMatchTimes)
  );

  /**
   * Category 1, move match: Match slots (table in match) that are either empty or have a null team,
   * that do not interfere with the rematch team's judging session.
   */
  const categoryOne = availableMatches
    .filter(match => !judgingInterference(dayjs(judgingTime), dayjs(match.scheduledTime)))
    .map(match => ({ match })); //TODO: Find the exact table we can compete in

  /**
   * Category 2, move match and judging: Match slots (table in match) that are either empty or have a null team,
   * and will not interfere if the team's judging moves to an available judging slot (null or unregistered).
   */
  const categoryTwo = availableJudgingSlots.map(session => {
    const matches = availableMatches.filter(
      match => !judgingInterference(dayjs(session.scheduledTime), dayjs(match.scheduledTime))
    ); //TODO: find the exact table we can compete in;
    return { session, matches };
  });

  // !Note! At all times, prefer occupying an unregisterd slot over a null slot.
  // If no category has any option, notify FTA that running an unscheduled rematch is the only option.
  // (Reminder on how to run it is required)

  return (
    <Paper sx={{ p: 2 }}>
      {judgingTime?.toString()}
      <br />
      {availableMatches.map(m => `${m.number} - ${m.scheduledTime}`).join(', ')}
      <br />
      {availableJudgingSlots.map(s => `${s.number} - ${s.scheduledTime}`).join(', ')}
      <br />
      {JSON.stringify(categoryOne)}
      <br />
      {JSON.stringify(categoryTwo)}
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
