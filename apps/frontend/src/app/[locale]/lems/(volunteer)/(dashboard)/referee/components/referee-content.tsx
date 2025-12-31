'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Stack } from '@mui/material';
import { getUnscoredScoresheets } from '../utils';
import {
  useReferee,
  RefereeMatchTimer,
  RefereePrestart,
  RefereeSchedule,
  RefereeNoMatch
} from './index';

export const RefereeContent = () => {
  const router = useRouter();
  const { displayState, sortedMatches, tableId } = useReferee();

  useEffect(() => {
    if (displayState === 'scoresheet') {
      const scoresheetRedirect = getUnscoredScoresheets(sortedMatches, tableId);
      if (scoresheetRedirect) {
        router.push(
          `/lems/team/${scoresheetRedirect.teamSlug}/scoresheet/${scoresheetRedirect.scoresheetSlug}`
        );
      }
    }
  }, [displayState, sortedMatches, tableId, router]);

  switch (displayState) {
    case 'timer':
      return <RefereeMatchTimer />;

    case 'prestart':
      return (
        <Stack spacing={3}>
          <RefereePrestart />
          <RefereeSchedule />
        </Stack>
      );

    case 'scoresheet':
      return null;

    case 'none':
    default:
      return (
        <Stack spacing={3}>
          <RefereeNoMatch />
          <RefereeSchedule />
        </Stack>
      );
  }
};
