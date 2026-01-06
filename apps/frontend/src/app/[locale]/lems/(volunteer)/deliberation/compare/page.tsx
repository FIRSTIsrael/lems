'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Container, Alert, Box, Grid, Card, Paper, CircularProgress } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../../(dashboard)/components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import { GET_COMPARE_TEAMS, GET_DIVISION_TEAMS } from './graphql';
import type {
  CompareTeamsData,
  CompareTeamsVars,
  DivisionTeamsData,
  DivisionTeamsVars
} from './graphql/types';
import { CompareProvider, type DivisionTeam } from './compare-context';
import {
  EmptyState,
  TeamHeader,
  ScoreSummary,
  RubricScores,
  ExceedingNotes,
  Nominations,
  GpScores,
  Feedback,
  CategoryFilter,
  TeamSelector
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

  // Query all division teams for team selector
  const { data: divisionData } = usePageData<
    DivisionTeamsData,
    DivisionTeamsVars,
    DivisionTeamsData
  >(GET_DIVISION_TEAMS, { divisionId: currentDivision.id }, undefined, undefined, {
    refetchIntervalMs: 0
  });

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
  const allTeams: DivisionTeam[] = divisionData?.division?.teams ?? [];

  return (
    <CompareProvider
      teams={teams}
      awards={awards}
      allTeams={allTeams}
      category={categoryParam ?? undefined}
    >
      <PageHeader title={t('title')}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <Card
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2
            }}
          >
            <TeamSelector currentTeams={teamSlugs} compact />
          </Card>
          <Card
            variant="outlined"
            sx={{
              p: 1.5,
              borderRadius: 2
            }}
          >
            <CategoryFilter currentCategory={categoryParam ?? undefined} compact />
          </Card>
        </Box>
      </PageHeader>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {teams.map(team => (
            <Grid
              key={team.id}
              size={
                categoryParam
                  ? { xs: 12, sm: 6, md: 6, lg: 4 }
                  : { xs: 12, sm: 6, md: 6, lg: teams.length > 2 ? 4 : 6 }
              }
            >
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
                {(!categoryParam || categoryParam === 'core-values') && <GpScores team={team} />}
                <Feedback team={team} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </CompareProvider>
  );
}
