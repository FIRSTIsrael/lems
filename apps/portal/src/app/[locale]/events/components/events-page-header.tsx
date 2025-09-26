'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { Season } from '@lems/types/api/portal';

interface EventsPageHeaderProps {
  currentSeason: Season;
  seasons: Season[];
}

export default function EventsPageHeader({ currentSeason, seasons }: EventsPageHeaderProps) {
  const t = useTranslations('pages.events');
  const router = useRouter();

  return (
    <>
      <Typography
        variant="h3"
        component="h1"
        fontWeight="bold"
        sx={{
          mb: 4,
          fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
        }}
      >
        {t('title')} - {currentSeason.name}
      </Typography>
      <FormControl sx={{ mb: 4, minWidth: 200 }}>
        <InputLabel id="season-select-label">{t('select-season')}</InputLabel>
        <Select
          labelId="season-select-label"
          id="season-select"
          label={t('select-season')}
          value={currentSeason.slug}
          onChange={e => router.push(`/events/${e.target.value}`)}
        >
          {seasons.map(season => (
            <MenuItem key={season.slug} value={season.slug}>
              {season.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
}
