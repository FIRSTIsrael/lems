'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Container, Alert, Box, Grid, Card, Paper, CircularProgress } from '@mui/material';
import { JudgingCategory } from '@lems/types/judging';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../../(dashboard)/components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import { GET_UNIFIED_DIVISION, type DivisionTeam } from './graphql';
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
  CategoryFilter,
  TeamSelector
} from './components';

export default function ComparePage() {
  const router = useRouter();
  const t = useTranslations('layouts.deliberation.compare');
  const { currentDivision } = useEvent();
  const searchParams = useSearchParams();

  const teamSlugsParam = searchParams.get('teams');
  const categoryParam = searchParams.get('category') as JudgingCategory | null;
  const teamSlugs = teamSlugsParam?.split(',').filter(Boolean).slice(0, 6) ?? [];

  const { data, loading, error } = usePageData(
    GET_UNIFIED_DIVISION,
    teamSlugs.length > 0
      ? { divisionId: currentDivision.id, teamSlugs }
      : { divisionId: currentDivision.id }
  );

  if (loading) {
    return (
      <>
        <PageHeader title={t('title')} onBack={() => router.back()} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
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
        </Container>
      </>
    );
  }

  if (teamSlugs.length === 0) {
    return (
      <>
        <PageHeader title={t('title')} onBack={() => router.back()} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <EmptyState />
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title={t('title')} onBack={() => router.back()} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error">{t('error-loading-teams')}</Alert>
        </Container>
      </>
    );
  }

  if (!data?.division?.selectedTeams || data.division.selectedTeams.length === 0) {
    return (
      <>
        <PageHeader title={t('title')} onBack={() => router.back()} />
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="warning">{t('teams-not-found')}</Alert>
        </Container>
      </>
    );
  }

  const teams = data.division.selectedTeams;
  const awards = data.division.judging?.awards ?? [];
  const allTeams: DivisionTeam[] = data.division.allTeams ?? [];

  return (
    <CompareProvider
      teams={teams}
      awards={awards}
      allTeams={allTeams}
      category={categoryParam ?? undefined}
    >
      <PageHeader title={t('title')} onBack={() => router.back()}>
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
