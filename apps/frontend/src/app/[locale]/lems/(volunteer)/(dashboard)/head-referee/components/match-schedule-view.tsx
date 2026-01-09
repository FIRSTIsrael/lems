'use client';

import { Stack } from '@mui/material';
import { useHeadRefereeData } from './head-referee-context';
import { RoundSchedule } from './round-schedule';

export function MatchScheduleView() {
  const { roundGroups } = useHeadRefereeData();

  if (roundGroups.length === 0) {
    return null;
  }

  return (
    <Stack spacing={2}>
      {roundGroups.map(group => (
        <RoundSchedule key={`${group.stage}-${group.round}`} roundGroup={group} />
      ))}
    </Stack>
  );
}
