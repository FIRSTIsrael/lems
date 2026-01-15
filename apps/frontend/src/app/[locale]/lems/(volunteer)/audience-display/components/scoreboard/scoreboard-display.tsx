'use client';

import { useMemo } from 'react';
import { Box, Stack } from '@mui/material';
import { useEvent } from '../../../components/event-context';
import { usePageData } from '../../../hooks/use-page-data';
import { useAudienceDisplay } from '../audience-display-context';
import {
  createMatchAbortedSubscription,
  createMatchCompletedSubscription,
  createMatchEndgameTriggeredSubscription,
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
import { ScoresTable } from './scores-table';
import { SponsorsRow } from './sponsors-row';
import { useFieldSounds } from './hooks/use-field-sounds';

export const ScoreboardDisplay = () => {
  const { currentDivision } = useEvent();
  const { settings } = useAudienceDisplay();
  const scoreboardSettings = settings?.scoreboard;
  const playSound = useFieldSounds();

  const subscriptions = useMemo(
    () => [
      createMatchLoadedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id, () => playSound('start')),
      createMatchAbortedSubscription(currentDivision.id, () => playSound('abort')),
      createMatchEndgameTriggeredSubscription(currentDivision.id, () => playSound('endgame')),
      createMatchCompletedSubscription(currentDivision.id, () => playSound('end')),
      createMatchStageAdvancedSubscription(currentDivision.id),
      createScoresheetUpdatedSubscription(currentDivision.id)
    ],
    [currentDivision.id, playSound]
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
          backgroundImage: 'url(/assets/audience-display/audience-display-background.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Stack
          maxWidth="80vw"
          spacing={2}
          sx={{
            animation: 'fadeIn 0.6s ease-out'
          }}
          height="90%"
          width="100%"
        >
          {(scoreboardSettings?.showActiveMatch as boolean) && <ActiveMatch />}
          {(scoreboardSettings?.showPreviousMatch as boolean) && <PreviousMatch />}
          <ScoresTable />
          {(scoreboardSettings?.showSponsorsRow as boolean) && <SponsorsRow />}
        </Stack>

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
