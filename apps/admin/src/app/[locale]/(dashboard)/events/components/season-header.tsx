'use client';

import React from 'react';
import { Typography, Button, Stack, Avatar, Box } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useTranslations } from 'next-intl';

interface SeasonHeaderProps {
  seasonName: string;
  logoUrl: string | null;
  onCreateEvent: () => void;
  numberOfEvents?: number;
  allowCreate?: boolean;
}

export const SeasonHeader: React.FC<SeasonHeaderProps> = ({
  seasonName,
  logoUrl,
  onCreateEvent,
  numberOfEvents = 0,
  allowCreate = false
}) => {
  const t = useTranslations('pages.events');

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar
          variant="rounded"
          sx={{ width: 64, height: 64 }}
          src={logoUrl ?? '/assets/FIRST-Logo.svg'}
        />
        <Box>
          <Typography variant="h4" component="h2" dir="ltr">
            {seasonName}
          </Typography>
          {numberOfEvents > 0 && (
            <Typography variant="body2" color="text.secondary">
              {numberOfEvents} {numberOfEvents === 1 ? 'event' : 'events'}
            </Typography>
          )}
        </Box>
      </Stack>

      {allowCreate && (
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={onCreateEvent}
          sx={{ borderRadius: 8 }}
        >
          {t('create-button')}
        </Button>
      )}
    </Stack>
  );
};
