import React, { useMemo } from 'react';
import { WithId } from 'mongodb';
import { Stack } from '@mui/material';
import { DivisionState, RobotGameMatch, Scoresheet, Team } from '@lems/types';
import ScoreboardSponsorsRow from './sponsors-row';
import ScoreboardCurrentMatch from './current-match';
import ScoreboardScores from './scores';
import ScoreboardPreviousMatch from './previous-match';

interface ScoreboardProps {
  activeMatch: WithId<RobotGameMatch> | undefined;
  previousMatch: WithId<RobotGameMatch> | undefined;
  scoresheets: Array<WithId<Scoresheet>>;
  teams: Array<WithId<Team>>;
  divisionState: DivisionState;
}

const Scoreboard: React.FC<ScoreboardProps> = ({
  activeMatch,
  previousMatch,
  scoresheets,
  teams,
  divisionState
}) => {
  const settings = useMemo(() => {
    const { showCurrentMatch, showPreviousMatch, showSponsors } =
      divisionState.audienceDisplay.scoreboard;

    return {
      currentMatch: !!showCurrentMatch,
      currentMatchTimer: showCurrentMatch === 'timer',
      previousMatch: showPreviousMatch,
      sponsors: showSponsors
    };
  }, [divisionState.audienceDisplay.scoreboard]);

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
      {settings.currentMatch && (
        <ScoreboardCurrentMatch activeMatch={activeMatch} showTimer={settings.currentMatchTimer} />
      )}
      {settings.previousMatch && (
        <ScoreboardPreviousMatch
          previousMatch={previousMatch}
          previousScoresheets={scoresheets.filter(
            s =>
              s.stage === previousMatch?.stage &&
              s.round === previousMatch?.round &&
              previousMatch?.participants.some(p => p.teamId === s.teamId)
          )}
          size={12}
          px={4}
          py={2}
        />
      )}
      <ScoreboardScores scoresheets={scoresheets} teams={teams} divisionState={divisionState} />
      {settings.sponsors && <ScoreboardSponsorsRow />}
    </Stack>
  );
};

export default Scoreboard;
