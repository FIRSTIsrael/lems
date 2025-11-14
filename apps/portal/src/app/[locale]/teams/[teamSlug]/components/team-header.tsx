'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Box, Paper, Stack, Typography, Avatar } from '@mui/material';
import { LocationOn as LocationIcon, CalendarToday as CalendarIcon } from '@mui/icons-material';
import { Element } from 'react-scroll';
import { Flag } from '@lems/shared/components/flag';
import { useTeam } from './team-context';

export const TeamHeader: React.FC = () => {
  const team = useTeam();
  const t = useTranslations('pages.team');

  return (
    <Element name="team-info">
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Avatar
            variant="square"
            src={team.logoUrl ?? '/assets/default-avatar.svg'}
            alt={t('team-logo-alt', { number: team.number })}
            sx={{ width: 72, height: 72, objectFit: 'cover' }}
          />

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h4" component="h1" fontWeight="500">
              {t('title', { number: team.number, name: team.name })}
            </Typography>
            <Flag region={team.region} size={30} />
          </Stack>
        </Stack>

        <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
          <Stack spacing={2}>
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

            {team.lastCompetedSeason && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <CalendarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {t('info.last-competed', { season: team.lastCompetedSeason.name })}
                </Typography>
              </Stack>
            )}
          </Stack>
        </Box>
      </Paper>
    </Element>
  );
};
