'use client';

import { Stack } from '@mui/material';
import { useCategoryDeliberation } from '../deliberation-context';
import { RoomScoresDistribution } from './room-scores-distribution';
import { CompareTeamsPicker } from './compare-teams-picker';

export function Metrics() {
  const { roomMetrics, teams } = useCategoryDeliberation();

  return (
    <Stack direction="row" spacing={2.5} height={270}>
      <RoomScoresDistribution roomMetrics={roomMetrics} teams={teams} />
      <CompareTeamsPicker teams={teams} />
    </Stack>
  );
}
