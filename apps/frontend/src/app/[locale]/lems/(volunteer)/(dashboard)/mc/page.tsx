'use client';

import { useMemo } from 'react';
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
  createMatchCompletedSubscription
} from './graphql';
import { CurrentMatchHero } from './components/current-match-hero';
import { MatchScheduleTable } from './components/match-schedule-table';
import { AwardsPlaceholder } from './components/awards-placeholder';
import { McLoadingSkeleton } from './components/mc-loading-skeleton';

export default function McPage() {
  const t = useTranslations('pages.mc');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createMatchLoadedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id),
      createMatchCompletedSubscription(currentDivision.id)
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
    <>
      <PageHeader title={t('page-title')} />
      <Container maxWidth="xl" sx={{ pt: 3, pb: 3 }}>
        <Stack spacing={3}>
          <CurrentMatchHero
            loadedMatch={data.loadedMatch}
            matches={data.matches}
            currentStage={data.currentStage}
          />
          <MatchScheduleTable matches={data.matches} currentStage={data.currentStage} />
          <AwardsPlaceholder />
        </Stack>
      </Container>
    </>
  );
}
