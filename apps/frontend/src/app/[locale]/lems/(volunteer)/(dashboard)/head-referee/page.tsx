'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Container, Stack } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import { PageHeader } from '../components/page-header';
import { LoadingSkeleton } from './components/loading-skeleton';
import { HeadRefereeProvider } from './components/head-referee-context';
import { Filters } from './components/filters';
import { EscalatedScoresheetsPanel } from './components/escalated-scoresheets-panel';
import { MatchScheduleView } from './components/match-schedule-view';
import {
  GET_HEAD_REFEREE_DATA,
  parseHeadRefereeData,
  createMatchLoadedSubscription,
  createMatchCompletedSubscription,
  createParticipantStatusUpdatedSubscription,
  createScoresheetUpdatedSubscription
} from './graphql';

export default function HeadRefereePage() {
  const t = useTranslations('pages.head-referee');
  const { currentDivision } = useEvent();

  // Memoize subscriptions to keep the array reference stable
  const subscriptions = useMemo(
    () => [
      createMatchLoadedSubscription(currentDivision.id),
      createMatchCompletedSubscription(currentDivision.id),
      createParticipantStatusUpdatedSubscription(currentDivision.id),
      createScoresheetUpdatedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_HEAD_REFEREE_DATA,
    { divisionId: currentDivision.id },
    parseHeadRefereeData,
    subscriptions
  );

  if (error) throw error;
  if (loading || !data) return <LoadingSkeleton />;

  return (
    <HeadRefereeProvider data={data}>
      <PageHeader title={t('page-title')} />
      <Container maxWidth="xl" sx={{ pt: 3, pb: 3 }}>
        <Stack spacing={3}>
          <Filters />
          <EscalatedScoresheetsPanel />
          <MatchScheduleView />
        </Stack>
      </Container>
    </HeadRefereeProvider>
  );
}
