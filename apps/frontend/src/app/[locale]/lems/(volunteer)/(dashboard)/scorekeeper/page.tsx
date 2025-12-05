'use client';

import { useTranslations } from 'next-intl';
import { Container, Typography, Stack, Grid } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import { GET_SCOREKEEPER_DATA, parseScorekeeperData } from './scorekeeper.graphql';
import { MatchScheduleTable } from './components/schedule/match-schedule-table';
import { CurrentMatchDisplay } from './components/active-match/current-match-display';
import { NextMatchDisplay } from './components/loaded-match/next-match-display';
import { ControlButtons } from './components/control/control-buttons';
import { AudienceDisplayControl } from './components/audience-display-control';
import { ScorekeeperLoadingSkeleton } from './components/scorekeeper-loading-skeleton';
import { ScorekeeperProvider } from './components/scorekeeper-context';

export default function ScorekeeperPage() {
  const t = useTranslations('pages.scorekeeper');
  const { currentDivision } = useEvent();

  const { data, loading, error } = usePageData(
    GET_SCOREKEEPER_DATA,
    {
      divisionId: currentDivision.id
    },
    parseScorekeeperData
  );

  if (error) {
    throw error || new Error('Failed to load scorekeeper data');
  }

  // HACK: For some reason there are 2 frames
  // where loading is false but data is undefined
  if (loading || !data) {
    return (
      <>
        <PageHeader title={t('page-title')} />
        <Container maxWidth="xl" sx={{ pt: 3, pb: 3 }}>
          <ScorekeeperLoadingSkeleton />
        </Container>
      </>
    );
  }

  const matchesInStage =
    data.matches.filter(match => {
      return match.stage === data.currentStage;
    }).length || 0;

  return (
    <>
      <PageHeader title={t('page-title')} />
      <Container maxWidth="xl" sx={{ pt: 3, pb: 3 }}>
        <ScorekeeperProvider data={data}>
          <Stack spacing={3}>
            <Grid container spacing={3}>
              <Grid size={{ lg: 12, xl: 6 }}>
                <Stack spacing={2} height="100%">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                    {t('audience-display.section-title')}
                  </Typography>
                  <AudienceDisplayControl />
                </Stack>
              </Grid>

              <Grid size={{ lg: 12, xl: 6 }}>
                <Stack spacing={2} height="100%">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                    {t('controls.section-title')}
                  </Typography>
                  <ControlButtons />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Stack spacing={2}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                    {t('current-match.section-title')}
                  </Typography>
                  <CurrentMatchDisplay />
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Stack spacing={2} height="100%">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                    {t('next-match.section-title')}
                  </Typography>
                  <NextMatchDisplay />
                </Stack>
              </Grid>
            </Grid>

            <Stack spacing={2}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                {t('schedule.title')} ({matchesInStage})
              </Typography>
              <MatchScheduleTable />
            </Stack>
          </Stack>
        </ScorekeeperProvider>
      </Container>
    </>
  );
}
