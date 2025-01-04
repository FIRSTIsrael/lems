import { WithId } from 'mongodb';
import { useState } from 'react';
import { Socket } from 'socket.io-client';
import { Paper, Typography } from '@mui/material';
import {
  DivisionState,
  JudgingSession,
  JudgingRoom,
  RobotGameMatch,
  Team,
  WSClientEmittedEvents,
  WSServerEmittedEvents
} from '@lems/types';
import TeamSelection from '../general/team-selection';
import RematchScheduler from './rematch-scheduler';

interface RematchFinderProps {
  teams: Array<WithId<Team>>;
  rooms: Array<WithId<JudgingRoom>>;
  matches: Array<WithId<RobotGameMatch>>;
  sessions: Array<WithId<JudgingSession>>;
  divisionState: WithId<DivisionState>;
  socket: Socket<WSServerEmittedEvents, WSClientEmittedEvents>;
}

const RematchFinder: React.FC<RematchFinderProps> = ({
  teams,
  matches,
  rooms,
  sessions,
  divisionState,
  socket
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
    .filter(team => !!team);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h2" mb={3}>
        הענקת מקצה חוזר
      </Typography>
      <TeamSelection setTeam={setRematchTeam} teams={eligibleTeams} value={rematchTeam} />
      {rematchTeam && (
        <RematchScheduler
          team={rematchTeam}
          teams={teams}
          divisionState={divisionState}
          matches={matches}
          rooms={rooms}
          sessions={sessions}
          socket={socket}
        />
      )}
    </Paper>
  );
};

export default RematchFinder;
