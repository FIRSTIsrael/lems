'use client';

import React from 'react';
import useSWR from 'swr';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FormControl, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { Season } from '@lems/types/api/portal';
import { RichText } from '@lems/localization';

interface EventsPageHeaderProps {
  currentSeason: Season;
}

export const EventsPageHeader: React.FC<EventsPageHeaderProps> = ({
  currentSeason
}: EventsPageHeaderProps) => {
  const t = useTranslations('pages.events');
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: seasons = [] } = useSWR<Season[]>('/portal/seasons', {
    suspense: true,
    fallbackData: []
  });

  const handleSeasonChange = (seasonSlug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('season', seasonSlug);
    router.push(`?${params.toString()}`);
  };

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
        {<RichText>{tags => t.rich('title', tags)}</RichText>}
      </Typography>
      <FormControl sx={{ mb: 4, minWidth: 200 }}>
        <InputLabel id="season-select-label">{t('select-season')}</InputLabel>
        <Select
          labelId="season-select-label"
          id="season-select"
          label={t('select-season')}
          value={currentSeason.slug}
          onChange={e => handleSeasonChange(e.target.value)}
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
};
