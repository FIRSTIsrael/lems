'use client';

import { useTranslations } from 'next-intl';
import { Box, Container, Typography, Stack } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import { GET_SCOREKEEPER_DATA } from './scorekeeper.graphql';
import { MatchScheduleTable } from './match-schedule-table';

export default function ScorekeeperPage() {
  const t = useTranslations('pages.scorekeeper');
  const { currentDivision } = useEvent();

  const { data, loading, error } = usePageData(GET_SCOREKEEPER_DATA, {
    divisionId: currentDivision?.id
  });

  return (
    <>
      <PageHeader title={t('page-title')} />
      <Container maxWidth="lg" sx={{ pt: 3, pb: 3 }}>
        {loading && <Typography>{t('common.loading')}</Typography>}
        {error && (
          <Typography color="error">
            {t('common.error')}: {error.message}
          </Typography>
        )}
        {data && (
          <Stack spacing={3}>
            {/* Match Schedule Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('schedule.title')} ({data.division?.field.matches.length || 0})
              </Typography>
              <MatchScheduleTable
                matches={data.division.field.matches}
                currentStage={data.division.field.currentStage}
                loadedMatchId={data.division.field.loadedMatch}
              />
            </Box>
          </Stack>
        )}
      </Container>
    </>
  );
}
