import { WithId } from 'mongodb';
import { useState, useMemo } from 'react';
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

  /**
   * Crude implementation for detection of staggered matches.
   * We assume the first match is always filled to the brim, and staggering means 50% of tables are empty..
   */
  const matchStaggering = useMemo(() => {
    const firstMatch = matches.find(m => m.number === 1);
    if (!firstMatch) return null; // Should never happen
    if (
      firstMatch.participants.filter(p => p.teamId === null).length >=
      firstMatch.participants.length / 2
    )
      return true;
    return false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Crude implemenation for finding the match cycle time for the current round.
   * Assumes the first two matches are consecutive with no breaks.
   */
  const matchCycleTime = useMemo(() => {
    const roundMatches = matches
      .filter(m => m.round === divisionState.currentRound)
      .sort((a, b) => dayjs(a.scheduledTime).diff(dayjs(b.scheduledTime))); // TODO: might need to flip
    const firstMatch = roundMatches[0];
    const secondMatch = roundMatches[1];
    if (!firstMatch || !secondMatch) return 0; // Should never happen
    return dayjs(secondMatch.scheduledTime).diff(dayjs(firstMatch.scheduledTime), 'seconds');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divisionState.currentRound]);

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

  /**
   * Finds all the participants in a match which are either empty or have an unregistered team.
   * For each participant, return whether the fit is tight or not, in case of staggering.
   * Tight in this case means that the team is slotted between two consecutive staggered matches, which halves the cycle time.
   */
  const getAvailableParticipants = (match: WithId<RobotGameMatch>) => {
    let nextMatch =
      matches.find(m => m.number === match.number + 1 && m.round === match.round) ?? null;
    if (
      nextMatch &&
      dayjs(nextMatch.scheduledTime).diff(dayjs(match.scheduledTime)) > matchCycleTime
    ) {
      nextMatch = null; // Next match is not consecutive
    }

    const availableSlots = match.participants
      .map((participant, index) => {
        if (participant.teamId && !unregisteredTeamIds.includes(participant.teamId)) return null;

        let tight = false;
        if (
          matchStaggering &&
          nextMatch &&
          nextMatch.participants[index].teamId &&
          !unregisteredTeamIds.includes(nextMatch.participants[index].teamId)
        ) {
          tight = true;
        }

        return { index, tight };
      })
      .filter(element => element !== null);

    return availableSlots;
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
   * Category 1, move match: Match participants that are either empty or have a null team,
   * that do not interfere with the rematch team's judging session.
   */
  const categoryOne = availableMatches
    .filter(match => !judgingInterference(dayjs(judgingTime), dayjs(match.scheduledTime)))
    .map(match => {
      const participants = getAvailableParticipants(match);
      return { match, participants };
    });

  /**
   * Category 2, move match and judging: Match slots (table in match) that are either empty or have a null team,
   * and will not interfere if the team's judging moves to an available judging slot (null or unregistered).
   */
  const categoryTwo = availableJudgingSlots.map(session => {
    const matches = availableMatches.filter(
      match => !judgingInterference(dayjs(session.scheduledTime), dayjs(match.scheduledTime))
    );

    const matchesWithParticipants = matches.map(match => {
      const participants = getAvailableParticipants(match);
      return { match, participants };
    });

    return { session, matches: matchesWithParticipants };
  });

  // !UI Note! Prefer non-staggered participants, if none are available take the last or 2nd last staggered participant only.
  // If no category has any option, notify FTA that running an unscheduled rematch is the only option.
  // (Reminder on how to run it is required)

  if (!judgingTime) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography>לא נמצא זמן שיפוט לקבוצה</Typography>
      </Paper>
    );
  }

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
