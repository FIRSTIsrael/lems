'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import useSWR from 'swr';
import { useSearchParams } from 'next/navigation';
import { Typography, Paper, Stack, Box } from '@mui/material';
import { TeamEventResult } from '@lems/types/api/portal';
import { Element } from 'react-scroll';
import { TeamEventResultCard } from './team-event-result-card';
import { useTeam } from './team-context';

export const TeamResults: React.FC = () => {
  const searchParams = useSearchParams();
  const team = useTeam();
  const season = searchParams.get('season') ?? 'latest';
  const tEvents = useTranslations('pages.team.events');

  const { data: eventResults } = useSWR<TeamEventResult[]>(
    () => `/portal/teams/${team.number}/seasons/${season}/results`,
    { suspense: true, fallbackData: [] }
  );

  if (!eventResults || eventResults.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Element name="event-results">
        <Box>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 600 }}>
            {tEvents('event-performance')}
          </Typography>
        </Box>
      </Element>
      <Stack spacing={3} sx={{ mt: 3 }}>
        {eventResults.map(eventResult => (
          <TeamEventResultCard key={`event-${eventResult.eventSlug}`} eventResult={eventResult} />
        ))}
      </Stack>
    </Paper>
  );
};
