'use client';

import { useMemo } from 'react';
import { Box } from '@mui/material';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import {
  createMatchAbortedSubscription,
  createMatchCompletedSubscription,
  createMatchLoadedSubscription,
  createMatchStageAdvancedSubscription,
  createMatchStartedSubscription,
  createScoresheetUpdatedSubscription,
  GET_SCOREBOARD_DATA,
  parseScoreboardData
} from './graphql';
import { ScoreboardProvider } from './scoreboard-context';
import { ActiveMatch } from './active-match';
import { PreviousMatch } from './previous-match';

export const ScoreboardDisplay = () => {
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createMatchLoadedSubscription(currentDivision.id),
      createMatchAbortedSubscription(currentDivision.id),
      createMatchCompletedSubscription(currentDivision.id),
      createMatchStageAdvancedSubscription(currentDivision.id),
      createScoresheetUpdatedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_SCOREBOARD_DATA,
    {
      divisionId: currentDivision.id
    },
    parseScoreboardData,
    subscriptions
  );

  if (error) {
    throw error || new Error('Failed to load scoreboard data');
  }

  if (loading || !data) {
    return null;
  }

  return (
    <ScoreboardProvider fieldData={data}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'url(/assets/audience-display/season-background.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
          p: 4
        }}
      >
        <Box
          maxWidth="xl"
          sx={{
            position: 'relative',
            zIndex: 1,
            width: '100%',
            animation: 'fadeIn 0.6s ease-out',
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          <ActiveMatch />
          <PreviousMatch />
        </Box>

        <style>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
      </Box>
    </ScoreboardProvider>
  );
};
