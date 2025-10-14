'use client';

import React from 'react';
import { Typography, Paper, Stack, Box } from '@mui/material';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { TeamEventResult } from '@lems/types/api/portal';
import { EventCard } from './event-card';
import { useTeam } from './team-context';

export const TeamResults: React.FC = () => {
  const searchParams = useSearchParams();
  const team = useTeam();
  const season = searchParams.get('season') ?? 'latest';
  const tEvents = useTranslations('pages.team.events');

  const { data: eventResults } = useSWR<TeamEventResult[]>(
    () => `/portal/teams/${team.id}/seasons/${season}/results`,
    {
      suspense: true,
      fallbackData: []
    }
  );

  if (!eventResults || eventResults.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 3 }}>
      {/* Event Results */}
      <Box id="event-results">
        <Typography variant="h2" sx={{ mb: 2, fontWeight: 600 }}>
          {tEvents('event-performance')}
        </Typography>
        <Stack spacing={3}>
          {eventResults.map((eventResult, index) => (
            <EventCard key={index} eventResult={eventResult} />
          ))}
        </Stack>
      </Box>
    </Paper>
  );
};
