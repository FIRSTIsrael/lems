'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Container, Box } from '@mui/material';
import { PageHeader } from '../../components/page-header';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { GET_SCOREBOARD, parseScoreboard } from './graphql/query';
import { createScoresheetStatusChangedSubscription } from './graphql/subscriptions/scoresheet-status-changed';
import { ScoreboardTable } from './components/scoreboard-table';
import { ErrorState } from './components/error-state';
import { EmptyState } from './components/empty-state';
import { LoadingState } from './components/loading-state';

export default function ScoreboardPage() {
  const t = useTranslations('pages.reports.scoreboard');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [createScoresheetStatusChangedSubscription(currentDivision.id)],
    [currentDivision.id]
  );

  const {
    data: scoreboard = [],
    loading,
    error
  } = usePageData(
    GET_SCOREBOARD,
    { divisionId: currentDivision.id },
    parseScoreboard,
    subscriptions
  );

  const hasData = scoreboard.length > 0;

  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
        <PageHeader title={t('page-title')} />

        <Box
          sx={{
            px: { xs: 0, sm: 1 },
            py: { xs: 2, sm: 3, md: 4 }
          }}
        >
          {error && <ErrorState />}

          {!error && !hasData && !loading && <EmptyState />}

          {!error && hasData && <ScoreboardTable teams={scoreboard} />}

          {loading && <LoadingState />}
        </Box>
      </Stack>
    </Container>
  );
}
