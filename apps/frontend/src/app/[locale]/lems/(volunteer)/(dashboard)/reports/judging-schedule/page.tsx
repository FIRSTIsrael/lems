'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Stack, Container, Box } from '@mui/material';
import { PageHeader } from '../../components/page-header';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import {
  GET_JUDGING_SCHEDULE,
  parseJudgingSchedule,
  createTeamArrivalSubscription
} from './graphql';
import { ScheduleTable } from './components/schedule-table';
import { ErrorState } from './components/error-state';
import { EmptyState } from './components/empty-state';
import { LoadingState } from './components/loading-state';

export default function JudgingSchedulePage() {
  const t = useTranslations('pages.reports.judging-schedule');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [createTeamArrivalSubscription(currentDivision.id)],
    [currentDivision.id]
  );

  const {
    data = { rooms: [], rows: [], sessionLength: 0 },
    loading,
    error
  } = usePageData(
    GET_JUDGING_SCHEDULE,
    { divisionId: currentDivision.id },
    parseJudgingSchedule,
    subscriptions
  );

  const hasData = data.rows.length > 0;

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

          {!error && hasData && (
            <ScheduleTable rooms={data.rooms} rows={data.rows} sessionLength={data.sessionLength} />
          )}

          {loading && <LoadingState />}
        </Box>
      </Stack>
    </Container>
  );
}
