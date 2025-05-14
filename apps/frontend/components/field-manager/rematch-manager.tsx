import { WithId } from 'mongodb';
import { useState } from 'react';
import { Paper, Typography } from '@mui/material';
import { DivisionState, JudgingSession, RobotGameMatch, TeamRegistration } from '@lems/types';
import TeamSelection from '../general/team-selection';
import TeamRematchScheduler from './team-rematch-scheduler';

interface RematchManagerProps {
  teams: Array<WithId<TeamRegistration>>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  divisionState: WithId<DivisionState>;
  isStaggered: boolean;
  onScheduleRematch: (
    team: WithId<TeamRegistration>,
    match: WithId<RobotGameMatch>,
    participantIndex: number
  ) => void;
}

const RematchManager: React.FC<RematchManagerProps> = ({
  teams,
  matches,
  sessions,
  divisionState,
  isStaggered,
  onScheduleRematch
}) => {
  const [rematchTeam, setRematchTeam] = useState<WithId<TeamRegistration> | null>(null);

  const doesTeamHavePendingMatch = (team: WithId<TeamRegistration>) =>
    matches.find(
      match =>
        match.stage === 'ranking' &&
        match.round === divisionState.currentRound &&
        match.status === 'not-started' &&
        match.participants.find(participant => participant.teamId === team._id)
    );

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
    .filter(team => !doesTeamHavePendingMatch(team));

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
          isStaggered={isStaggered}
          onScheduleRematch={(
            team: WithId<TeamRegistration>,
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
