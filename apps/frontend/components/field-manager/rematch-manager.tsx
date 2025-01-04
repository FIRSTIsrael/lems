import { WithId } from 'mongodb';
import { useState } from 'react';
import { Paper, Typography } from '@mui/material';
import { DivisionState, JudgingSession, RobotGameMatch, Team } from '@lems/types';
import TeamSelection from '../general/team-selection';
import TeamRematchScheduler from './team-rematch-scheduler';

interface RematchManagerProps {
  teams: Array<WithId<Team>>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  divisionState: WithId<DivisionState>;
  onScheduleRematch: (
    team: WithId<Team>,
    match: WithId<RobotGameMatch>,
    participantIndex: number
  ) => void;
}

const RematchManager: React.FC<RematchManagerProps> = ({
  teams,
  matches,
  sessions,
  divisionState,
  onScheduleRematch
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

  /**
   * Teams that have already played in the current round
   */
  const eligibleTeams = matches
    .filter(
      match =>
        match.stage === 'ranking' &&
        match.round === divisionState.currentRound &&
        match.status === 'completed'
    )
    .flatMap(match => match.participants)
    .map(participant => teams.find(team => team._id === participant.teamId))
    .filter(team => !!team)
    // Filter out teams that have a pending rematch
    .filter(
      team =>
        !matches.find(
          match =>
            match.stage === 'ranking' &&
            match.round === divisionState.currentRound &&
            match.status === 'not-started' &&
            match.participants.find(participant => participant.teamId === team._id)
        )
    );

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h2" mb={3}>
        הענקת מקצה חוזר
      </Typography>
      <TeamSelection setTeam={setRematchTeam} teams={eligibleTeams} value={rematchTeam} />
      {rematchTeam && (
        <TeamRematchScheduler
          team={rematchTeam}
          teams={teams}
          divisionState={divisionState}
          matches={matches}
          sessions={sessions}
          onScheduleRematch={(
            team: WithId<Team>,
            match: WithId<RobotGameMatch>,
            participantIndex: number
          ) => {
            onScheduleRematch(team, match, participantIndex);
            setRematchTeam(null);
          }}
        />
      )}
    </Paper>
  );
};

export default RematchManager;
