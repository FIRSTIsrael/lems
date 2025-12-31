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
  createMatchCompletedSubscription,
  createMatchStartedSubscription,
  createTeamArrivedSubscription
} from './graphql';
import { RoundSchedule } from './components/round-schedule';
import { EmptyState } from './components/empty-state';

export default function FieldSchedulePage() {
  const t = useTranslations('pages.reports.field-schedule');
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createMatchCompletedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id),
      createTeamArrivedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_FIELD_SCHEDULE,
    { divisionId: currentDivision.id },
    parseFieldScheduleData,
    subscriptions
  );

  // Group matches by round (stage + round number)
  const roundMatches = useMemo(() => {
    if (!data) return {};

    return data.matches
      .filter(m => m.stage !== 'test')
      .reduce(
        (result: { [key: string]: typeof data.matches }, match) => {
          const roundKey = `${match.stage}-${match.round}`;
          (result[roundKey] = result[roundKey] || []).push(match);
          return result;
        },
        {} as { [key: string]: typeof data.matches }
      );
  }, [data]);

  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={{ xs: 3, sm: 4, md: 5 }}>
        <PageHeader title={t('page-title')} />

        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3, md: 4 } }}>
          {error && (
            <Box sx={{ textAlign: 'center', py: 4, color: 'error.main' }}>{t('error-loading')}</Box>
          )}

          {!error && !loading && data && Object.keys(roundMatches).length === 0 && <EmptyState />}

          {!error && data && Object.keys(roundMatches).length > 0 && (
            <Grid container spacing={2}>
              {Object.entries(roundMatches).map(([key, matches]) => (
                <Grid key={key} size={{ xs: 12, xl: 6 }}>
                  <RoundSchedule
                    matches={matches}
                    tables={data.tables}
                    teams={data.teams}
                    agendaEvents={data.agendaEvents}
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
