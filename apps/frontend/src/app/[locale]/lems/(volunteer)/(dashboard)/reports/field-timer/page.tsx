'use client';

import { useMemo } from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Stack, Container, Box, Typography, Alert } from '@mui/material';
import { ResponsiveComponent } from '@lems/shared';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { useTime } from '../../../../../../../lib/time/hooks';
import {
  GET_ACTIVE_MATCH_DATA,
  parseActiveMatchData,
  createMatchStartedSubscription,
  createMatchCompletedSubscription,
  createMatchAbortedSubscription
} from './graphql';
import { TimerDisplay } from './components/timer-display';
import { MatchInfo } from './components/match-info';
import { ProgressBar } from './components/progress-bar';

export default function FieldTimerPage() {
  const t = useTranslations('pages.reports.field-timer');
  const { currentDivision } = useEvent();
  const currentTime = useTime({ interval: 100 });

  const subscriptions = useMemo(
    () => [
      createMatchStartedSubscription(currentDivision.id),
      createMatchCompletedSubscription(currentDivision.id),
      createMatchAbortedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const {
    data,
    loading,
    error
  } = usePageData(
    GET_ACTIVE_MATCH_DATA,
    { 
      divisionId: currentDivision.id,
      activeMatchId: null 
    },
    parseActiveMatchData,
    subscriptions
  );

  const { activeMatch, matchLength } = data || { activeMatch: null, matchLength: 150 };

  const matchEndTime = useMemo(() => {
    if (!activeMatch?.startTime) return null;
    return dayjs(activeMatch.startTime).add(matchLength, 'seconds').toDate();
  }, [activeMatch, matchLength]);

  const percentRemaining = useMemo(() => {
    if (!matchEndTime) return 100;
    const remaining = dayjs(matchEndTime).diff(currentTime, 'milliseconds');
    const total = matchLength * 1000;
    return Math.max(0, Math.min(100, (remaining / total) * 100));
  }, [matchEndTime, currentTime, matchLength]);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 200px)'
          }}
        >
          <Typography variant="h4" color="text.secondary">
            {t('loading')}
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl">
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{t('error-loading')}</Alert>
        </Box>
      </Container>
    );
  }

  if (!activeMatch || !matchEndTime) {
    return (
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 'calc(100vh - 200px)'
          }}
        >
          <Typography
            variant="h2"
            color="text.secondary"
            fontWeight={300}
            sx={{
              textAlign: 'center',
              opacity: 0.6
            }}
          >
            {t('no-active-match')}
          </Typography>
        </Box>
      </Container>
    );
  }

  const renderContent = (isDesktop: boolean) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
        py: isDesktop ? 8 : 4
      }}
    >
      <Stack spacing={isDesktop ? 4 : 2}>
        <MatchInfo match={activeMatch} isDesktop={isDesktop} />
        <Box>
          <TimerDisplay targetDate={matchEndTime} isDesktop={isDesktop} />
          <ProgressBar percentRemaining={percentRemaining} />
        </Box>
      </Stack>
    </Box>
  );

  return (
    <Container maxWidth="xl" disableGutters>
      <ResponsiveComponent
        desktop={renderContent(true)}
        mobile={renderContent(false)}
      />
    </Container>
  );
}
