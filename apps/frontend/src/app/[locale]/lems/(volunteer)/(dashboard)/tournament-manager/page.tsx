'use client';

import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { GET_TOURNAMENT_MANAGER_DATA } from './graphql';
import { SwapPanel } from './components/swap-panel';
import { ScheduleReference } from './components/schedule-reference';

export default function TournamentManagerPage() {
  const { currentDivision } = useEvent();

  const { data, loading, error, refetch } = useQuery(GET_TOURNAMENT_MANAGER_DATA, {
    variables: { divisionId: currentDivision.id },
    pollInterval: 60000 // Poll every 60 seconds
  });

  const handleSwapComplete = useMemo(
    () => async () => {
      await refetch();
    },
    [refetch]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">Failed to load tournament manager data</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 2,
        height: '100%'
      }}
    >
      {/* Swap Panel - Top on mobile, Side on desktop */}
      <Box
        sx={{
          width: { xs: '100%', lg: '450px' },
          order: { xs: 1, lg: 1 },
          flexShrink: 0
        }}
      >
        <SwapPanel division={data.division} onSwapComplete={handleSwapComplete} />
      </Box>

      {/* Schedule Display - Bottom on mobile, Main on desktop */}
      <Box
        sx={{
          flex: 1,
          order: { xs: 2, lg: 2 },
          minHeight: 0,
          overflow: 'auto'
        }}
      >
        <ScheduleReference division={data.division} />
      </Box>
    </Box>
  );
}
