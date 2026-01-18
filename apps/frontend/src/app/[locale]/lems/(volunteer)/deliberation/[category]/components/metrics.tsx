'use client';

import { Stack } from '@mui/material';
import { underscoresToHyphens } from '@lems/shared/utils';
import { JudgingCategory } from '@lems/database';
import { useCategoryDeliberation } from '../deliberation-context';
import { RoomScoresDistribution } from '../../components/room-metrics';
import { CompareTeamsPicker } from '../../components/compare-picker';

export function Metrics() {
  const { roomMetrics, teams, deliberation } = useCategoryDeliberation();

  const category = deliberation
    ? (underscoresToHyphens(deliberation.category as string) as JudgingCategory)
    : undefined;

  return (
    <Stack direction="row" spacing={2.5} height={270}>
      <RoomScoresDistribution roomMetrics={roomMetrics} teams={teams} />
      <CompareTeamsPicker teams={teams} category={category} />
    </Stack>
  );
}
