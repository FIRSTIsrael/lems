'use client';

import React from 'react';
import { Typography, Stack, Avatar } from '@mui/material';
import { useTranslations } from 'next-intl';
import { useTeam } from './team-context';

export const TeamTitle: React.FC = () => {
  const team = useTeam();
  const t = useTranslations('pages.team');

  return (
    <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
      <Avatar
        variant="square"
        src={team.logoUrl ?? '/assets/default-avatar.svg'}
        alt={t('team-logo-alt', { number: team.number })}
        sx={{ width: 72, height: 72, objectFit: 'cover' }}
      />

      <Typography variant="h4" component="h1" fontWeight="500">
        {t('title', { number: team.number, name: team.name })}
      </Typography>
    </Stack>
  );
};
