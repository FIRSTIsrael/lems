'use client';

import { useQuery } from '@apollo/client/react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { GET_TOURNAMENT_MANAGER_DATA } from './graphql';
import { ScheduleReference } from './components/schedule-reference';

export default function TournamentManagerPage() {
  const { currentDivision } = useEvent();

  const { data, loading, error } = useQuery(GET_TOURNAMENT_MANAGER_DATA, {
    variables: { divisionId: currentDivision.id },
    pollInterval: 60000 // Poll every 60 seconds
  });

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
        height: '100%',
        overflow: 'auto'
      }}
    >
      <ScheduleReference division={data.division} />
    </Box>
  );
}
