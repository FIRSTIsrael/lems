'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Container, Typography, Stack, Grid } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import { GET_SCOREKEEPER_DATA, Match, ScorekeeperData } from './scorekeeper.graphql';
import { MatchScheduleTable } from './components/match-schedule-table';
import { CurrentMatchDisplay } from './components/current-match-display';
import { NextMatchDisplay } from './components/next-match-display';
import { ControlButtons } from './components/control-buttons';
import { AudienceDisplayControl, AudienceDisplayMode } from './components/audience-display-control';
import { ScorekeeperLoadingSkeleton } from './components/scorekeeper-loading-skeleton';
import { ScorekeeperProvider } from './scorekeeper-context';

// Sample hardcoded data for visualization
const SAMPLE_MATCHES: Match[] = [
  {
    id: 'match-1',
    slug: 'practice-1',
    stage: 'PRACTICE',
    round: 1,
    number: 1,
    scheduledTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    status: 'completed',
    participants: [
      {
        team: { id: 'team-1', name: 'Team Phoenix', number: 1234 },
        table: { id: 'table-1', name: 'Field 1' }
      },
      {
        team: { id: 'team-2', name: 'Team Nexus', number: 5678 },
        table: { id: 'table-1', name: 'Field 1' }
      },
      {
        team: { id: 'team-3', name: 'Team Spark', number: 9012 },
        table: { id: 'table-1', name: 'Field 1' }
      }
    ]
  },
  {
    id: 'match-2',
    slug: 'practice-2',
    stage: 'PRACTICE',
    round: 1,
    number: 2,
    scheduledTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 mins from now
    status: 'in-progress',
    participants: [
      {
        team: { id: 'team-4', name: 'Team Horizon', number: 3456 },
        table: { id: 'table-1', name: 'Field 1' }
      },
      {
        team: { id: 'team-5', name: 'Team Zenith', number: 7890 },
        table: { id: 'table-1', name: 'Field 1' }
      },
      {
        team: { id: 'team-6', name: 'Team Vortex', number: 2345 },
        table: { id: 'table-1', name: 'Field 1' }
      }
    ]
  },
  {
    id: 'match-3',
    slug: 'practice-3',
    stage: 'PRACTICE',
    round: 1,
    number: 3,
    scheduledTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 mins from now
    status: 'not-started',
    participants: [
      {
        team: { id: 'team-7', name: 'Team Apex', number: 6789 },
        table: { id: 'table-1', name: 'Field 1' }
      },
      {
        team: { id: 'team-8', name: 'Team Quantum', number: 123 },
        table: { id: 'table-1', name: 'Field 1' }
      },
      {
        team: { id: 'team-9', name: 'Team Flux', number: 4567 },
        table: { id: 'table-1', name: 'Field 1' }
      }
    ]
  },
  {
    id: 'match-4',
    slug: 'practice-4',
    stage: 'PRACTICE',
    round: 1,
    number: 4,
    scheduledTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 mins from now
    status: 'not-started',
    participants: [
      {
        team: null,
        table: { id: 'table-1', name: 'Field 1' }
      },
      {
        team: null,
        table: { id: 'table-1', name: 'Field 1' }
      },
      {
        team: null,
        table: { id: 'table-1', name: 'Field 1' }
      }
    ]
  }
];

const SAMPLE_DATA: ScorekeeperData = {
  division: {
    id: 'div-1',
    field: {
      matches: SAMPLE_MATCHES,
      currentStage: 'PRACTICE',
      loadedMatch: 'match-3',
      activeMatch: 'match-2',
      matchLength: 150 // seconds
    }
  }
};

export default function ScorekeeperPage() {
  const t = useTranslations('pages.scorekeeper');
  const { currentDivision } = useEvent();
  const [audienceDisplayMode, setAudienceDisplayMode] =
    useState<AudienceDisplayMode>('match-preview');
  const [useSampleData] = useState(true); // Set to false to use real data from GraphQL

  const { data, loading, error } = usePageData(GET_SCOREKEEPER_DATA, {
    divisionId: currentDivision?.id
  });

  const handleAudienceDisplayChange = (mode: AudienceDisplayMode) => {
    setAudienceDisplayMode(mode);
    // TODO: Implement mutation to change audience display
    console.log('Change audience display to:', mode);
  };

  // Use sample data for visualization if enabled and no real data is available
  // Use sample data for visualization if enabled and no real data is available
  const displayData = useSampleData || !data ? SAMPLE_DATA : data;

  return (
    <>
      <PageHeader title={t('page-title')} />
      <Container maxWidth="xl" sx={{ pt: 3, pb: 3 }}>
        {error && !useSampleData && (
          <Typography color="error">
            {t('common.error')}: {error.message}
          </Typography>
        )}

        {loading && !useSampleData ? (
          <ScorekeeperLoadingSkeleton />
        ) : (
          displayData && (
            <ScorekeeperProvider
              matches={displayData.division.field.matches}
              matchLength={displayData.division.field.matchLength}
              currentStage={displayData.division.field.currentStage}
              loadedMatchId={displayData.division.field.loadedMatch}
              activeMatchId={displayData.division.field.activeMatch}
            >
              <Stack spacing={3}>
                <Grid container spacing={3}>
                  <Grid size={{ lg: 12, xl: 6 }}>
                    <Stack spacing={2} height="100%">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                        {t('audience-display.section-title')}
                      </Typography>
                      <AudienceDisplayControl
                        currentMode={audienceDisplayMode}
                        onModeChange={handleAudienceDisplayChange}
                      />
                    </Stack>
                  </Grid>

                  <Grid size={{ lg: 12, xl: 6 }}>
                    <Stack spacing={2} height="100%">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                        {t('controls.section-title')}
                      </Typography>
                      <ControlButtons
                        onStartTestMatch={async () => {
                          console.log('Start test match');
                        }}
                        onLoadNextMatch={async () => {
                          console.log('Load next match');
                        }}
                        onStartMatch={async () => {
                          console.log('Start match');
                        }}
                        onAbortMatch={async () => {
                          console.log('Abort match');
                        }}
                      />
                    </Stack>
                  </Grid>

                  {/* Current and Next Match Display */}
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

                {/* Match Schedule Section */}
                <Stack spacing={2}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                    {t('schedule.title')} ({displayData.division.field.matches.length || 0})
                  </Typography>
                  <MatchScheduleTable />
                </Stack>
              </Stack>
            </ScorekeeperProvider>
          )
        )}
      </Container>
    </>
  );
}
