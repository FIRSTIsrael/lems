'use client';

import React from 'react';
import {
  Box,
  Typography,
  Stack,
  Link as MuiLink
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Language as WebsiteIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { Team } from './mockTeamData';

interface TeamInfoProps {
  team: Team;
}

export const TeamInfo: React.FC<TeamInfoProps> = ({ team }) => {
  const t = useTranslations('pages.team');

  return (
    <Box sx={{ flex: 2 }}>
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

        {/* Rookie Year */}
        {team.rookieYear && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2">{t('info.rookie-year', { year: team.rookieYear })}</Typography>
          </Stack>
        )}

        {/* Last Competed */}
        {team.lastCompeted && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2">{t('info.last-competed', { year: team.lastCompeted })}</Typography>
          </Stack>
        )}

        {/* Website - Only show if team has a website */}
        {team.website && (
          <Stack direction="row" alignItems="center" spacing={1}>
            <WebsiteIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2">
              {t('info.details-on')}{' '}
              <MuiLink href={`https://${team.website}`} color="primary">
                {team.website}
              </MuiLink>
            </Typography>
          </Stack>
        )}

        {/* Social Media - Commented out for now */}
        {/* <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{ mt: 2, flexWrap: 'wrap' }}
        >
          Social media buttons would go here
        </Stack> */}
      </Stack>
    </Box>
  );
};
