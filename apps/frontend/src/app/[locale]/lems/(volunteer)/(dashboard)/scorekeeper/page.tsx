'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Container, Typography, Stack, Grid, Switch, FormControlLabel } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { PageHeader } from '../components/page-header';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_SCOREKEEPER_DATA,
  parseScorekeeperData,
  createMatchLoadedSubscription,
  createMatchStartedSubscription,
  createMatchStageAdvancedSubscription,
  createMatchCompletedSubscription,
  createMatchAbortedSubscription,
  createTeamArrivalSubscription,
  createAudienceDisplaySwitchedSubscription,
  createAudienceDisplaySettingUpdatedSubscription,
  createMatchParticipantUpdatedSubscription,
  createParticipantStatusUpdatedSubscription,
  createPresentationUpdatedSubscription
} from './graphql';
import { MatchScheduleTable } from './components/schedule/match-schedule-table';
import { ActiveMatchDisplay } from './components/active-match/active-match-display';
import { LoadedMatchDisplay } from './components/loaded-match/loaded-match-display';
import { ControlButtons } from './components/control/control-buttons';
import { AudienceDisplayControl } from './components/audience-display-control';
import { ScorekeeperLoadingSkeleton } from './components/scorekeeper-loading-skeleton';
import { ScorekeeperProvider } from './components/scorekeeper-context';
import { AwardsPresentationWrapper } from './components/awards-presentation/awards-presentation-wrapper';

export default function ScorekeeperPage() {
  const t = useTranslations('pages.scorekeeper');
  const { currentDivision } = useEvent();
  const [hideCompletedMatches, setHideCompletedMatches] = useState(false);

  const subscriptions = useMemo(
    () => [
      createTeamArrivalSubscription(currentDivision.id),
      createMatchLoadedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id),
      createMatchStageAdvancedSubscription(currentDivision.id),
      createMatchCompletedSubscription(currentDivision.id),
      createMatchAbortedSubscription(currentDivision.id),
      createAudienceDisplaySwitchedSubscription(currentDivision.id),
      createAudienceDisplaySettingUpdatedSubscription(currentDivision.id),
      createPresentationUpdatedSubscription(currentDivision.id),
      createMatchParticipantUpdatedSubscription(currentDivision.id),
      createParticipantStatusUpdatedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_SCOREKEEPER_DATA,
    {
      divisionId: currentDivision.id
    },
    parseScorekeeperData,
    subscriptions
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

  const isAwardsMode = data.field?.audienceDisplay?.activeDisplay === 'awards';

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

              {isAwardsMode ? (
                <Grid size={{ xs: 12 }}>
                  <Stack spacing={2} height="100%">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                      {t('awards-presentation.title')}
                    </Typography>
                    <AwardsPresentationWrapper />
                  </Stack>
                </Grid>
              ) : (
                <>
                  <Grid size={{ xs: 12, lg: 6 }}>
                    <Stack spacing={2} height="100%">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                        {t('current-match.section-title')}
                      </Typography>
                      <ActiveMatchDisplay />
                    </Stack>
                  </Grid>

                  <Grid size={{ xs: 12, lg: 6 }}>
                    <Stack spacing={2} height="100%">
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                        {t('next-match.section-title')}
                      </Typography>
                      <LoadedMatchDisplay />
                    </Stack>
                  </Grid>
                </>
              )}
            </Grid>

            {!isAwardsMode && (
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, px: 0.5 }}>
                    {t('schedule.title')}
                  </Typography>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={hideCompletedMatches}
                        onChange={() => setHideCompletedMatches(!hideCompletedMatches)}
                      />
                    }
                    label={
                      <Typography variant="subtitle2">{t('schedule.hide-completed')}</Typography>
                    }
                  />
                </Stack>
                <MatchScheduleTable hideCompleted={hideCompletedMatches} />
              </Stack>
            )}
          </Stack>
        </ScorekeeperProvider>
      </Container>
    </>
  );
}
