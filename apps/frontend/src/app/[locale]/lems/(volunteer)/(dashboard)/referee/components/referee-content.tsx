'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const { displayState, scoresheetRedirect, activeMatch, loadedMatch } = useReferee();

  // Redirect to scoresheet if needed
  useEffect(() => {
    if (displayState === 'scoresheet' && scoresheetRedirect) {
      router.push(
        `/lems/team/${scoresheetRedirect.teamSlug}/scoresheet/${scoresheetRedirect.scoresheetSlug}`
      );
    }
  }, [displayState, scoresheetRedirect, router]);

  // Determine what to display based on displayState
  switch (displayState) {
    case 'timer':
      return <RefereeMatchTimer />;

    case 'prestart':
      return (
        <Stack spacing={3}>
          <InspectionTimer />
          <RefereePrestart match={loadedMatch!} />
          <RefereeSchedule matches={[loadedMatch!]} limit={5} />
        </Stack>
      );

    case 'scoresheet':
      // This shouldn't render since we redirect, but show nothing just in case
      return null;

    case 'none':
    default:
      return (
        <Stack spacing={3}>
          <RefereeNoMatch />
          <RefereeSchedule matches={[]} limit={5} />
        </Stack>
      );
  }
};
