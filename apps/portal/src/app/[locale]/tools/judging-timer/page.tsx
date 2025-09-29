'use client';

import React from 'react';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useJudgingTimer } from '../../../../hooks/use-judging-timer';
import { JudgingTimerSetup } from '../../components/judging-timer/judging-timer-setup';
import { JudgingTimerDisplay } from '../../components/judging-timer/judging-timer-display';
import { JudgingStagesSidebar } from '../../components/judging-timer/judging-stages-sidebar';

function JudgingTimerPage() {
  const {
    isRunning,
    isPaused,
    sessionEnd,
    secondsJudging,
    currentStage,
    stagesToDisplay,
    handleStart,
    handlePause,
    handleStop
  } = useJudgingTimer();

  if (!isRunning) {
    return <JudgingTimerSetup onStart={handleStart} />;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, rgb(102, 126, 234) 0%, rgb(118, 75, 162) 100%)'
      }}
    >
      <Grid container width="80%" alignItems="flex-top" columnSpacing={4}>
        <Grid size={4}>
          <JudgingStagesSidebar stagesToDisplay={stagesToDisplay} currentStage={currentStage} />
        </Grid>
        <Grid size={8}>
          <JudgingTimerDisplay
            sessionEnd={sessionEnd?.toDate() || null}
            secondsJudging={secondsJudging}
            isPaused={isPaused}
            onPause={handlePause}
            onStop={handleStop}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default JudgingTimerPage;
