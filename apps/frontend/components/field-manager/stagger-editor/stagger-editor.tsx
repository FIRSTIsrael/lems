import { useMemo } from 'react';
import { WithId } from 'mongodb';
import { Paper, Typography } from '@mui/material';
import { DivisionState, RobotGameMatch } from '@lems/types';
import StaggerSchedule from './stagger-schedule';

interface StaggerEditorProps {
  matches: Array<WithId<RobotGameMatch>>;
  divisionState: WithId<DivisionState>;
}

const StaggerEditor: React.FC<StaggerEditorProps> = ({ matches, divisionState }) => {
  /* <Typography>Staggered match editor</Typography>
        <Typography>Show loaded (or next not started) +2 next matches</Typography>
        <Typography>Arrows between rows to shift teams to later /earlier matches</Typography>
        <Typography>Merge button that will merge loaded+next and complete loaded</Typography> */

  const [currentMatch, nextMatch, nextNextMatch] = useMemo(() => {
    const roundMatches = matches
      .filter(
        match =>
          match.stage === 'ranking' &&
          match.round === divisionState.currentRound &&
          match.status === 'not-started'
      )
      .sort((a, b) => a.number - b.number);

    console.log(roundMatches);

    let index = roundMatches.findIndex(match => match._id === divisionState.loadedMatch);
    if (index < 0) index = roundMatches.findIndex(match => match.status === 'not-started');
    if (index < 0) return [null, null, null];

    return [
      roundMatches[index] || null,
      roundMatches[index + 1] || null,
      roundMatches[index + 2] || null
    ];
  }, [matches, divisionState.loadedMatch, divisionState.currentRound]);

  return (
    <Paper sx={{ p: 2, my: 2 }}>
      <Typography variant="h2" mb={3}>
        עריכה מהירה
      </Typography>
      <StaggerSchedule
        currentMatch={currentMatch}
        nextMatch={nextMatch}
        nextNextMatch={nextNextMatch}
      />
    </Paper>
  );
};

export default StaggerEditor;
