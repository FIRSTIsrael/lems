'use client';

import { useMemo } from 'react';
import { Container, Stack, Box, Grid } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { PageHeader } from '../../components/page-header';
import {
  GET_FIELD_SCHEDULE,
  parseFieldScheduleData,
  createTeamArrivedSubscription
} from './graphql';
import { RoundSchedule } from './components/round-schedule';
import { EmptyState } from './components/empty-state';
import { ErrorState } from './components/error-state';
import { LoadingState } from './components/loading-state';

export default function FieldSchedulePage() {
  const t = useTranslations('pages.reports.field-schedule');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [createTeamArrivedSubscription(currentDivision.id)],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_FIELD_SCHEDULE,
    { divisionId: currentDivision.id },
    parseFieldScheduleData,
    subscriptions
  );

  const hasData = data && Object.keys(data.roundMatches).length > 0;

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

          {!error && !loading && hasData && (
            <Grid container spacing={2}>
              {Object.entries(data.roundMatches).map(([key, matches]) => (
                <Grid key={key} size={{ xs: 12, xl: 6 }}>
                  <RoundSchedule
                    matches={matches}
                    tables={data.tables}
                    teams={data.teams}
                    rows={data.roundRowsMap[key]}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Stack>
    </Container>
  );
}
