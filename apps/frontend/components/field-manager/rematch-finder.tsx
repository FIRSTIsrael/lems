import { WithId } from 'mongodb';
import { useState } from 'react';
import { Stack, Paper, Typography } from '@mui/material';
import { DivisionState, JudgingSession, RobotGameMatch, Team } from '@lems/types';
import TeamSelection from '../general/team-selection';

interface RematchOptionsProps {
  rematchTeam: WithId<Team>;
  divisionState: WithId<DivisionState>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
}

const RematchOptions: React.FC<RematchOptionsProps> = ({
  rematchTeam,
  divisionState,
  matches,
  sessions
}) => {
  const judgingTime = sessions.find(session => session.teamId === rematchTeam._id)?.scheduledTime;

  const relevantMatches = matches.filter(
    match =>
      match.stage === 'ranking' &&
      match.round === divisionState.currentRound &&
      match.status === 'not-started' &&
      !match.participants.find(p => p.teamId === rematchTeam._id)
  );

  return (
    <Paper sx={{ p: 2 }}>
      {relevantMatches.length}
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
