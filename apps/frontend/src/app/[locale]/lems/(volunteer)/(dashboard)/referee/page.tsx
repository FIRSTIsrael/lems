'use client';

import { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Container, Stack, Box } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { useUser } from '../../../components/user-context';
import { useTime } from '../../../../../../lib/time/hooks';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_REFEREE_DATA,
  parseRefereeData,
  createMatchStartedSubscription,
  createMatchCompletedSubscription,
  createTeamArrivedSubscription
} from './graphql';
import {
  RefereeProvider,
  useReferee,
  RefereeMatchTimer,
  RefereePrestart,
  RefereeSchedule,
  RefereeNoMatch,
  InspectionTimer
} from './components';

// Content component that uses the referee context
function RefereeContent() {
  const router = useRouter();
  const { activeMatch, loadedMatch } = useReferee();
  const currentTime = useTime({ interval: 1000 });

  // Auto-navigate to scoresheet when match completes
  useEffect(() => {
    if (activeMatch && activeMatch.status === 'completed') {
      // Navigate to scoresheet for this match
      router.push(`/lems/scoresheet/${activeMatch.id}`);
    }
  }, [activeMatch, router]);

  // Calculate elapsed seconds for active match
  const elapsedSeconds = useMemo(() => {
    if (!activeMatch?.startTime) return 0;
    const startTime = new Date(activeMatch.startTime).getTime();
    return Math.floor((currentTime.valueOf() - startTime) / 1000);
  }, [activeMatch, currentTime]);

  // Determine what to display
  if (activeMatch && activeMatch.status === 'in-progress') {
    return (
      <Stack spacing={3}>
        <RefereeMatchTimer match={activeMatch} elapsedSeconds={elapsedSeconds} />
        <RefereeSchedule matches={[activeMatch, ...(loadedMatch ? [loadedMatch] : [])]} limit={3} />
      </Stack>
    );
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
      <Box>
        <RefereeSchedule matches={[]} limit={5} />
      </Box>
    </Stack>
  );
}

// Main page component
export default function RefereePage() {
  const t = useTranslations('pages.referee');
  const { currentDivision } = useEvent();
  const user = useUser();

  // Get referee's assigned table from roleInfo
  const tableId = useMemo(() => {
    if (user.role === 'referee' && user.roleInfo?.tableId) {
      return user.roleInfo.tableId as string;
    }
    return '';
  }, [user]);

  const subscriptions = useMemo(
    () => [
      createTeamArrivedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id),
      createMatchCompletedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_REFEREE_DATA,
    {
      divisionId: currentDivision.id,
      tableId
    },
    parseRefereeData,
    subscriptions
  );

  if (error) {
    throw error || new Error('Failed to load referee data');
  }

  if (loading || !data || !tableId) {
    return (
      <>
        <PageHeader title={t('page-title')} />
        <Container maxWidth="lg" sx={{ pt: 3, pb: 3 }}>
          <Box sx={{ animation: 'pulse 2s infinite' }}>Loading referee data...</Box>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader title={t('page-title')} />
      <Container maxWidth="lg" sx={{ pt: 3, pb: 3 }}>
        <RefereeProvider data={data}>
          <RefereeContent />
        </RefereeProvider>
      </Container>
    </>
  );
}
