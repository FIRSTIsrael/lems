'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Paper, Button, Avatar, Chip, Stack, Typography, Box } from '@mui/material';
import { ArrowBack, ArrowForward, LocationOn as LocationIcon } from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';
import { Team } from '@lems/types/api/portal';

interface TeamInfoHeaderProps {
  team: Team;
  eventName: string;
  eventSlug: string;
  divisionName: string;
  teamScoreboard?: {
    robotGameRank: number | null;
    maxScore: number | null;
  };
}

const TeamInfoHeader: React.FC<TeamInfoHeaderProps> = ({
  team,
  eventName,
  eventSlug,
  divisionName,
  teamScoreboard
}) => {
  const t = useTranslations('pages.team-in-event');

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button
          component={Link}
          href={`/event/${eventSlug}`}
          variant="outlined"
          startIcon={<DirectionalIcon ltr={ArrowBack} rtl={ArrowForward} />}
          size="small"
        >
          {t('header.back-to-event')}
        </Button>
        <Typography variant="body2" color="text.secondary">
          {eventName} • {divisionName}
        </Typography>
      </Stack>

      <Stack direction="row" alignItems="center" spacing={3}>
        <Avatar
          variant="square"
          src={team.logoUrl ?? '/assets/default-avatar.svg'}
          sx={{ width: 80, height: 80, objectFit: 'cover' }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
            {team.name} #{team.number}
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body1" color="text.secondary">
              {team.city} • {team.affiliation}
            </Typography>
          </Stack>
          {/* {teamScoreboard && (
            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
              <Chip
                label={t('header.rank', { rank: teamScoreboard.robotGameRank || 0 })}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={t('header.best-score', { score: teamScoreboard.maxScore || 0 })}
                color="success"
                variant="outlined"
              />
            </Stack>
          )} */}
        </Box>
      </Stack>
    </Paper>
  );
};

export { TeamInfoHeader };
