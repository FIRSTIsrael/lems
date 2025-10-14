'use client';

import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { LocationOn as LocationIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { useTeam } from './team-context';

export const TeamInfo: React.FC = () => {
  const team = useTeam();
  const t = useTranslations('pages.team');

  return (
    <Stack spacing={2}>
      {/* Location */}
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <LocationIcon sx={{ fontSize: 20, mt: 0.2, color: 'text.secondary' }} />
        <Box>
          <Typography variant="body2" fontWeight="500">
            {t('info.from', { city: team.city })}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {team.affiliation}
          </Typography>
        </Box>
      </Stack>

      {/* Last Competed */}
      {team.lastCompetedSeason && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <CalendarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
          <Typography variant="body2">
            {t('info.last-competed', { season: team.lastCompetedSeason })}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
};
