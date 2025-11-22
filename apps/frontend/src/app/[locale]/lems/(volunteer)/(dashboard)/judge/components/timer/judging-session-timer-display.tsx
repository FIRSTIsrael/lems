'use client';

import { useCallback } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { JudgingSession } from '../../judge.graphql';
import { JudgingTimerMobileLayout } from './judging-timer-mobile-layout';
import { JudgingTimerDesktopLayout } from './judging-timer-desktop-layout';

interface JudgingSessionTimerDisplayProps {
  session: JudgingSession;
}

export const JudgingSessionTimerDisplay: React.FC<JudgingSessionTimerDisplayProps> = ({
  session
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleAbortSession = useCallback(() => {
    // Abort functionality to be implemented
  }, []);

  if (isMobile) {
    return <JudgingTimerMobileLayout session={session} />;
  }

  // Desktop/tablet view with sidebar
  return <JudgingTimerDesktopLayout session={session} />;
};
