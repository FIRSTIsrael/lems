'use client';

import { Paper } from '@mui/material';
import { useCompareContext } from '../compare-context';
import {
  TeamHeader,
  ScoreSummary,
  RubricScores,
  ExceedingNotes,
  Nominations,
  GpScores,
  Feedback
} from '.';
import type { Team } from '../graphql/types';

interface CompareTeamProps {
  team: Team;
}

export function CompareTeam({ team }: CompareTeamProps) {
  const { category } = useCompareContext();

  return (
    <Paper
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <TeamHeader team={team} />
      <ScoreSummary team={team} />
      <RubricScores team={team} />
      <ExceedingNotes team={team} />
      <Nominations team={team} />
      {(!category || category === 'core-values') && <GpScores team={team} />}
      <Feedback team={team} />
    </Paper>
  );
}
