import React from 'react';
import { WithId } from 'mongodb';
import { Stack } from '@mui/material';
import { EventState, RobotGameMatch, Scoresheet, Team } from '@lems/types';
import ScoreboardSponsorsRow from './sponsors-row';
import ScoreboardCurrentMatch from './current-match';
import ScoreboardScores from './scores';
import ScoreboardPreviousMatch from './previous-match';

interface ScoreboardProps {
  activeMatch: WithId<RobotGameMatch> | undefined;
  previousMatch: WithId<RobotGameMatch> | undefined;
  scoresheets: Array<WithId<Scoresheet>>;
  teams: Array<WithId<Team>>;
  eventState: EventState;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  activeMatch,
  previousMatch,
  scoresheets,
  teams,
  eventState
}) => {
  const showCurrentMatch = true;
  const showCurrentMatchTimer = true;
  const showSponsorsRow = false;
  const showPreviousMatch = true;

  return (
    <Stack
      p={4}
      spacing={2}
      height="100%"
      width="100%"
      position="absolute"
      top={0}
      left={0}
      sx={{
        backgroundImage: 'url(/assets/audience-display/season-background.webp)',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      }}
    >
      {showCurrentMatch && (
        <ScoreboardCurrentMatch activeMatch={activeMatch} showTimer={showCurrentMatchTimer} />
      )}
      {showSponsorsRow && <ScoreboardSponsorsRow />}
      {showPreviousMatch && (
        <ScoreboardPreviousMatch
          previousMatch={previousMatch}
          previousScoresheets={scoresheets.filter(
            s =>
              s.stage === previousMatch?.stage &&
              s.round === previousMatch?.round &&
              previousMatch?.participants.some(p => p.teamId === s.teamId)
          )}
          xs={12}
          px={4}
          py={2}
        />
      )}
      <ScoreboardScores scoresheets={scoresheets} teams={teams} eventState={eventState} />
    </Stack>
  );
};

export default Scoreboard;
