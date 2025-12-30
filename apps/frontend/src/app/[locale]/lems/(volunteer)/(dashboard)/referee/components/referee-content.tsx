'use client';

import { Stack } from '@mui/material';
import {
  useReferee,
  RefereeMatchTimer,
  RefereePrestart,
  RefereeSchedule,
  RefereeNoMatch,
  InspectionTimer
} from './index';

// Content component that uses the referee context
export const RefereeContent = () => {
  const { activeMatch, loadedMatch } = useReferee();

  // Determine what to display
  if (activeMatch && activeMatch.status === 'in-progress') {
    return <RefereeMatchTimer />;
  }

  if (loadedMatch) {
    return (
      <Stack spacing={3}>
        <InspectionTimer />
        <RefereePrestart match={loadedMatch} />
        <RefereeSchedule matches={[loadedMatch]} limit={5} />
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <RefereeNoMatch />
      <RefereeSchedule matches={[]} limit={5} />
    </Stack>
  );
};
