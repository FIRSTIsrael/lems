'use client';

import React from 'react';
import useSWR from 'swr';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Autocomplete,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { Season } from '@lems/types/api/portal';
import { RichText } from '@lems/localization';

interface EventsPageHeaderProps {
  currentSeason: Season;
  selectedRegions: string[];
  availableRegions: string[];
  onRegionsChange: (regions: string[]) => void;
}

export const EventsPageHeader: React.FC<EventsPageHeaderProps> = ({
  currentSeason,
  selectedRegions,
  availableRegions,
  onRegionsChange
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
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          alignItems: { xs: 'flex-start', sm: 'center' }
        }}
      >
        <FormControl sx={{ minWidth: 200 }}>
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

        <Box sx={{ minWidth: 200 }}>
          <Autocomplete
            multiple
            size="medium"
            options={availableRegions}
            value={selectedRegions}
            onChange={(_event, value) => onRegionsChange(value)}
            renderInput={params => (
              <TextField
                {...params}
                size="medium"
                label={t('region.label')}
                placeholder={t('region.all')}
                variant="outlined"
              />
            )}
          />
        </Box>
      </Box>
    </>
  );
};
