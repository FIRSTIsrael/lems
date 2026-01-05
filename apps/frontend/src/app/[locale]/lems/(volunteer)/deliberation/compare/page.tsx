'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Container, CircularProgress, Box, Paper, Alert, Grid } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../../(dashboard)/components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import { GET_COMPARE_TEAMS } from './graphql';
import type { CompareTeamsData, CompareTeamsVars } from './graphql/types';
import { CompareProvider } from './compare-context';
import {
  EmptyState,
  TeamHeader,
  ScoreSummary,
  RubricScores,
  ExceedingNotes,
  Nominations,
  GpScores,
  Feedback,
  CategoryFilter
} from './components';

export default function ComparePage() {
  const t = useTranslations('layouts.deliberation.compare');
  const { currentDivision } = useEvent();
  const searchParams = useSearchParams();

  // Parse URL parameters
  const teamSlugsParam = searchParams.get('teams');
  const categoryParam = searchParams.get('category') as JudgingCategory | null;
  const teamSlugs = teamSlugsParam?.split(',').filter(Boolean).slice(0, 6) ?? [];

  // Query teams data
  const { data, loading, error } = usePageData<
    CompareTeamsData,
    CompareTeamsVars,
    CompareTeamsData
  >(
    GET_COMPARE_TEAMS,
    {
      teamSlugs,
      divisionId: currentDivision.id
    },
    undefined,
    undefined,
    { refetchIntervalMs: 0 }
  );

  // Empty state - no teams selected
  if (teamSlugs.length === 0 || loading) {
    return (
      <>
        <PageHeader title={t('title')} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          {loading ? (
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
          ) : (
            <EmptyState />
          )}
        </Container>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <PageHeader title={t('title')} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{t('error-loading-teams')}</Alert>
        </Container>
      </>
    );
  }

  // No teams found
  if (!data?.division?.teams || data.division.teams.length === 0) {
    return (
      <>
        <PageHeader title={t('title')} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="warning">{t('teams-not-found')}</Alert>
        </Container>
      </>
    );
  }

  const teams = data.division.teams;
  const awards = data.division.awards ?? [];

  return (
    <>
      <PageHeader title={t('title')} />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <CompareProvider teams={teams} awards={awards} category={categoryParam ?? undefined}>
          <CategoryFilter currentCategory={categoryParam ?? undefined} />
          <Grid container spacing={3}>
            {teams.map(team => (
              <Grid key={team.id} size={{ xs: 12, sm: 6, md: 6, lg: teams.length > 2 ? 4 : 6 }}>
                <Paper
                  sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  <TeamHeader team={team} />
                  <ScoreSummary team={team} />
                  <RubricScores team={team} />
                  <ExceedingNotes team={team} />
                  <Nominations team={team} />
                  <GpScores team={team} />
                  <Feedback team={team} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CompareProvider>
      </Container>
    </>
  );
}
