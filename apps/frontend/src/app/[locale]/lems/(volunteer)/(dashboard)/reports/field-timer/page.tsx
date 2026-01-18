'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { Box, Container } from '@mui/material';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import {
  GET_FIELD_TIMER_DATA,
  parseFieldTimerData,
  createMatchStartedSubscription,
  createMatchCompletedSubscription,
  createMatchAbortedSubscription
} from './graphql';
import { LoadingState } from './components/loading-state';
import { ErrorState } from './components/error-state';
import { TimerContent } from './components/timer-content';
import { FullscreenButton } from './components/fullscreen-button';
import { FieldTimerProvider } from './components/field-timer-context';

export default function FieldTimerPage() {
  const { currentDivision } = useEvent();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle fullscreen toggle
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
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Setup GraphQL subscriptions
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

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState />;
  }

  // Main content
  return (
    <FieldTimerProvider
      matches={matches}
      activeMatchId={activeMatchId || null}
      matchLength={matchLength}
    >
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
        <Container maxWidth="lg" sx={isFullscreen ? { minWidth: '100%', p: 0 } : {}}>
          <FullscreenButton isFullscreen={isFullscreen} onToggle={handleFullscreenToggle} />
          <TimerContent />
        </Container>
      </Box>
    </FieldTimerProvider>
  );
}
