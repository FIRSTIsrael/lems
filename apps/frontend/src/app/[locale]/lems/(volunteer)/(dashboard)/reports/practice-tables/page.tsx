'use client';

import { useMemo } from 'react';
import { Container, Stack, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { PageHeader } from '../../components/page-header';
import { GET_PRACTICE_TABLES_REPORT } from './graphql';
import { createPracticeTableAssignmentsSubscription } from './graphql/subscriptions';
import { PracticeTablesSchedule } from './components/practice-tables-schedule';
import { EmptyState } from './components/empty-state';
import { ErrorState } from './components/error-state';
import { LoadingState } from './components/loading-state';

export default function PracticeTablesReportPage() {
  const t = useTranslations('pages.reports.practice-tables');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [createPracticeTableAssignmentsSubscription(currentDivision.id)],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_PRACTICE_TABLES_REPORT,
    { divisionId: currentDivision.id },
    data => data,
    subscriptions
  );

  const hasData = data?.practiceTablesConfig && data?.practiceTableAssignments;

  return (
    <Container maxWidth="xl" disableGutters>
      <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
        <PageHeader title={t('page-title')} />

        <Box
          sx={{
            px: { xs: 0, sm: 1 },
            py: { xs: 2, sm: 3, md: 4 }
          }}
        >
          {loading && !error && <LoadingState />}

          {error && <ErrorState />}

          {!error && !hasData && !loading && <EmptyState />}

          {!error && !loading && hasData && data.practiceTablesConfig && (
            <PracticeTablesSchedule
              config={data.practiceTablesConfig}
              assignments={data.practiceTableAssignments}
            />
          )}
        </Box>
      </Stack>
    </Container>
  );
}
