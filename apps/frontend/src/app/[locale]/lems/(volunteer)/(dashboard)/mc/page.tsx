'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Container, Stack } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_MC_DATA,
  parseMcData,
  createMatchLoadedSubscription,
  createMatchStartedSubscription,
  createMatchCompletedSubscription,
  createTeamArrivedSubscription,
  createMatchStageAdvancedSubscription
} from './graphql';
import { CurrentMatchHero } from './components/current-match-hero';
import { MatchScheduleTable } from './components/match-schedule-table';
import { AwardsPlaceholder } from './components/awards-placeholder';
import { McLoadingSkeleton } from './components/mc-loading-skeleton';
import { McProvider } from './components/mc-context';
import { McModeToggle, type McMode } from './components/mc-mode-toggle';

export default function McPage() {
  const t = useTranslations('pages.mc');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentDivision } = useEvent();

  const mode = useMemo<McMode>(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'awards' || tabParam === 'matches') {
      return tabParam;
    }
    return 'matches';
  }, [searchParams]);

  const setMode = (newMode: McMode) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', newMode);
    router.push(`?${newSearchParams.toString()}`);
  };

  const handleModeChange = (newMode: McMode) => {
    setMode(newMode);
  };

  const subscriptions = useMemo(
    () => [
      createMatchLoadedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id),
      createMatchCompletedSubscription(currentDivision.id),
      createTeamArrivedSubscription(currentDivision.id),
      createMatchStageAdvancedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_MC_DATA,
    {
      divisionId: currentDivision.id
    },
    parseMcData,
    subscriptions
  );

  if (error) {
    throw error || new Error('Failed to load MC data');
  }

  if (loading || !data) {
    return (
      <>
        <PageHeader title={t('page-title')} />
        <Container maxWidth="xl" sx={{ pt: 3, pb: 3 }}>
          <McLoadingSkeleton />
        </Container>
      </>
    );
  }

  return (
    <McProvider
      matches={data.matches}
      currentStage={data.currentStage}
      loadedMatch={data.loadedMatch}
      awardsAssigned={data.awardsAssigned}
      loading={loading}
    >
      <PageHeader title={t('page-title')}>
        <McModeToggle mode={mode} setMode={handleModeChange} />
      </PageHeader>

      {mode === 'matches' && (
        <Stack spacing={3} my={3}>
          <CurrentMatchHero />
          <MatchScheduleTable />
        </Stack>
      )}

      {mode === 'awards' && (
        <Stack spacing={3} my={3}>
          <AwardsPlaceholder />
        </Stack>
      )}
    </McProvider>
  );
}
