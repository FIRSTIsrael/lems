'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Box, Container, CircularProgress } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { useEvent } from '../../../components/event-context';
import { PageHeader } from '../../components/page-header';
import { usePageData } from '../../../hooks/use-page-data';
import {
  GET_JUDGING_STATUS,
  createJudgingSessionStartedSubscription,
  createJudgingSessionCompletedSubscription,
  createTeamArrivalSubscription
} from './graphql';
import { JudgingStatusProvider } from './judging-status-context';
import { CountdownHeader } from './components/countdown-header';
import { JudgingStatusTable } from './components/judging-status-table';
import { JudgingStatusMobile } from './components/judging-status-mobile';

function JudgingStatusContent() {
  const t = useTranslations('pages.judging-status');

  return (
    <>
      <PageHeader title={t('page-title')} />
      <CountdownHeader />
      <Box py={1} width="100%">
        <ResponsiveComponent mobile={<JudgingStatusMobile />} desktop={<JudgingStatusTable />} />
      </Box>
    </>
  );
}

export default function JudgingStatusPage() {
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createJudgingSessionStartedSubscription(currentDivision.id),
      createJudgingSessionCompletedSubscription(currentDivision.id),
      createTeamArrivalSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_JUDGING_STATUS,
    { divisionId: currentDivision.id },
    undefined,
    subscriptions
  );

  if (error) {
    throw error || new Error('Failed to load judging status data');
  }

  if (loading || !data) {
    return (
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh'
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <JudgingStatusProvider data={data} loading={loading}>
      <JudgingStatusContent />
    </JudgingStatusProvider>
  );
}
