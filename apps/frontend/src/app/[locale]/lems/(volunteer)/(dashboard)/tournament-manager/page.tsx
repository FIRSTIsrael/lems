'use client';

import { useMemo } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useEvent } from '../../components/event-context';
import { usePageData } from '../../hooks/use-page-data';
import {
  GET_TOURNAMENT_MANAGER_DATA,
  createMatchLoadedSubscription,
  createMatchStartedSubscription,
  createMatchAbortedSubscription,
  createMatchCompletedSubscription,
  createSessionStartedSubscription,
  createSessionAbortedSubscription,
  createSessionCompletedSubscription
} from './graphql';
import { ScheduleReference } from './components/schedule-reference';

export default function TournamentManagerPage() {
  const { currentDivision } = useEvent();

  const subscriptions = useMemo(
    () => [
      createMatchLoadedSubscription(currentDivision.id),
      createMatchStartedSubscription(currentDivision.id),
      createMatchAbortedSubscription(currentDivision.id),
      createMatchCompletedSubscription(currentDivision.id),
      createSessionStartedSubscription(currentDivision.id),
      createSessionAbortedSubscription(currentDivision.id),
      createSessionCompletedSubscription(currentDivision.id)
    ],
    [currentDivision.id]
  );

  const { data, loading, error } = usePageData(
    GET_TOURNAMENT_MANAGER_DATA,
    { divisionId: currentDivision.id },
    undefined,
    subscriptions
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data?.division) {
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
