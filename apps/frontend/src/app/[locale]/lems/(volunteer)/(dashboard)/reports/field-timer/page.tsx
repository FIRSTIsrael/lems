'use client';

import { useMemo, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { Stack, Container, Box, Typography, Alert, IconButton } from '@mui/material';
import { Fullscreen, FullscreenExit } from '@mui/icons-material';
import { ResponsiveComponent } from '@lems/shared';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { useTime } from '../../../../../../../lib/time/hooks';
import {
  GET_FIELD_TIMER_DATA,
  parseFieldTimerData,
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
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFullscreenToggle = useCallback(async () => {
    const elem = document.documentElement;
    try {
      if (!isFullscreen) {
        await elem.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Error toggling fullscreen:', err);
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes from external triggers (e.g., ESC key)
  useMemo(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const subscriptions = useMemo(
    () => [
      createMatchStartedSubscription(currentDivision.id),
      createMatchCompletedSubscription(currentDivision.id),
      createMatchAbortedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_FIELD_TIMER_DATA,
    {
      divisionId: currentDivision.id
    },
    parseFieldTimerData,
    subscriptions
  );

  const {
    matches,
    activeMatch: activeMatchId,
    matchLength
  } = data || { matches: [], matchLength: 150 };

  const activeMatch = useMemo(() => {
    return matches.find(m => m.id === activeMatchId) || null;
  }, [matches, activeMatchId]);

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

  const renderContent = (isDesktop: boolean) => (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 24px)'
      }}
    >
      {activeMatch === null || matchEndTime === null ? (
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
      ) : (
        <Stack spacing={isDesktop ? 4 : 2}>
          <MatchInfo match={activeMatch} isDesktop={isDesktop} />
          <Box>
            <TimerDisplay targetDate={matchEndTime} isDesktop={isDesktop} />
            <ProgressBar percentRemaining={percentRemaining} />
          </Box>
        </Stack>
      )}
    </Box>
  );

  return (
    <Box
      sx={
        isFullscreen
          ? {
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              overflow: 'auto',
              backgroundColor: 'background.default'
            }
          : {}
      }
    >
      <Container sx={isFullscreen ? { minWidth: '100%' } : { minWidth: '100vh' }}>
        {isFullscreen && (
          <IconButton
            onClick={handleFullscreenToggle}
            sx={{
              position: 'fixed',
              top: 16,
              right: 16,
              zIndex: 9999,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)'
              }
            }}
          >
            <FullscreenExit />
          </IconButton>
        )}
        {!isFullscreen && (
          <IconButton
            onClick={handleFullscreenToggle}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16
            }}
          >
            <Fullscreen />
          </IconButton>
        )}
        <ResponsiveComponent desktop={renderContent(true)} mobile={renderContent(false)} />
      </Container>
    </Box>
  );
}
