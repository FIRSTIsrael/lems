'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Paper, Button, Avatar, Stack, Typography, Box } from '@mui/material';
import { ArrowBack, ArrowForward, LocationOn as LocationIcon } from '@mui/icons-material';
import { DirectionalIcon } from '@lems/localization';
import { Flag } from '@lems/shared';
import { useTeamAtEvent } from './team-at-event-context';

export const TeamInfoHeader: React.FC = () => {
  const { team, event, division } = useTeamAtEvent();

  const t = useTranslations('pages.team-in-event');

  return (
    <Paper
      sx={{
        p: 3,
        mb: { xs: 3, lg: 0 },
        flexGrow: { xs: 0, lg: 1 },
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          alignItems: "center",
          mb: 2
        }}>
        <Button
          component={Link}
          href={`/event/${event.slug}`}
          variant="outlined"
          startIcon={<DirectionalIcon ltr={ArrowBack} rtl={ArrowForward} />}
          size="small"
        >
          {t('header.back-to-event')}
        </Button>
        <Typography variant="body2" sx={{
          color: "text.secondary"
        }}>
          {event.name} {division.name && `• ${division.name}`}
        </Typography>
      </Stack>
      <Stack
        direction="row"
        spacing={3}
        component={Link}
        href={`/teams/${team.slug}`}
        sx={{
          alignItems: "center",
          textDecoration: 'none',
          color: 'inherit'
        }}>
        <Avatar
          variant="square"
          src={team.logoUrl ?? '/assets/default-avatar.svg'}
          sx={{ width: 80, height: 80, objectFit: 'cover' }}
        />
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: 1
            }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {team.name} #{team.number}
              <Flag region={team.region} size={24} />
            </Box>
          </Typography>
          <Stack
            direction="row"
            spacing={1}
            sx={{
              alignItems: "center",
              mt: 1
            }}>
            <LocationIcon fontSize="small" color="action" />
            <Typography variant="body1" sx={{
              color: "text.secondary"
            }}>
              {team.city} • {team.affiliation}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};
