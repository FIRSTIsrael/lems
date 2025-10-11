'use client';

import React from 'react';
import { Typography, Paper, Box, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { Team } from './mockTeamData';
import { WinnerBanners } from './winner-banners';
import { TeamAwards } from './team-awards';
import { EventCard } from './event-card';

interface TeamResultsProps {
  team: Team;
  teamNumber: number;
}

export const TeamResults: React.FC<TeamResultsProps> = ({ team }) => {
  const t = useTranslations('pages.team');
  const tEvents = useTranslations('pages.team.events');
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        {t('results.title')}
      </Typography>

      {/* Winner Banners */}
      <WinnerBanners isChampion={team.isChampion || false} />

      {/* Awards Section */}
      <TeamAwards awards={team.awards} />

      {/* Event Results */}
      {team.eventResults && team.eventResults.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 600 }}>
            {tEvents('event-performance')}
          </Typography>
          <Stack spacing={2}>
            {team.eventResults.map((eventResult, index) => (
              <EventCard key={index} eventResult={eventResult} />
            ))}
          </Stack>
        </Box>
      )}
    </Paper>
  );
};
