'use client';

import React from 'react';
import { Typography, Paper, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Team } from './mockTeamData';
import { EventCard } from './event-card';

interface TeamResultsProps {
  team: Team;
  teamNumber: number;
}

export const TeamResults: React.FC<TeamResultsProps> = ({ team }) => {
  const tEvents = useTranslations('pages.team.events');

  return (
    <Paper sx={{ p: 3 }}>
      {/* Event Results */}
      {team.eventResults && team.eventResults.length > 0 && (
        <>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 600 }}>
            {tEvents('event-performance')}
          </Typography>
          <Stack spacing={3}>
            {team.eventResults.map((eventResult, index) => (
              <EventCard key={index} eventResult={eventResult} />
            ))}
          </Stack>
        </>
      )}
    </Paper>
  );
};
