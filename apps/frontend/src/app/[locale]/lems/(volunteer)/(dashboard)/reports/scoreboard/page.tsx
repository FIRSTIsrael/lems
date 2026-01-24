'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Container, Box } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { PageHeader } from '../../components/page-header';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { GET_SCOREBOARD, parseScoreboard } from './graphql/query';
import { createScoresheetStatusChangedSubscription } from './graphql/subscriptions/scoresheet-status-changed';
import { createScoresheetUpdatedSubscription } from './graphql/subscriptions/scoresheet-updated';
import { ScoreboardTable } from './components/scoreboard-table';
import { MobileScoreboard } from './components/mobile-scoreboard';
import { LoadingState } from './components/loading-state';
import { ErrorState } from './components/error-state';

export default function ScoreboardPage() {
  const t = useTranslations('pages.reports.scoreboard');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createScoresheetStatusChangedSubscription(currentDivision.id),
      createScoresheetUpdatedSubscription(currentDivision.id)
    ],
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

  const matchesPerTeam = Math.max(...scoreboard.map(entry => entry.scores.length), 0);

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

          {loading && <LoadingState />}

          {!error && !loading && (
            <ResponsiveComponent
              desktop={<ScoreboardTable data={scoreboard} matchesPerTeam={matchesPerTeam} />}
              mobile={<MobileScoreboard data={scoreboard} matchesPerTeam={matchesPerTeam} />}
            />
          )}
        </Box>
      </Stack>
    </Container>
  );
}
