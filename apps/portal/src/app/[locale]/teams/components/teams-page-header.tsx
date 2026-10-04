'use client';

import React from 'react';
import useSWR from 'swr';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Box, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from '@mui/material';
import { RichText } from '@lems/localization';
import { Flag } from '@lems/shared';
import { TeamSearchInput } from './team-search-input';

export const TeamsPageHeader: React.FC = () => {
  const t = useTranslations('pages.teams');
  const router = useRouter();
  const searchParams = useSearchParams();
  const region = searchParams.get('region') || '';
  const search = searchParams.get('search') || '';

  const { data: regions = [] } = useSWR<string[]>('/portal/teams/regions', {
    fallbackData: []
  });

  const handleRegionChange = (newRegion: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newRegion) {
      params.set('region', newRegion);
    } else {
      params.delete('region');
    }
    params.set('page', '1');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = (searchValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleClearSearch = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    params.set('page', '1');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Stack spacing={3} sx={{ mb: 4 }}>
      <Typography
        variant="h3"
        component="h1"
        sx={{
          fontWeight: 'bold',
          fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' }
        }}
      >
        {<RichText>{tags => t.rich('title', tags)}</RichText>}
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 2,
          alignItems: 'flex-start'
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TeamSearchInput
            initialValue={search}
            placeholder={t('search.placeholder')}
            onSearchChange={handleSearchChange}
            onClear={handleClearSearch}
            showClearButton={!!search}
          />
        </Box>

        <FormControl size="small" sx={{ minWidth: 120, flexShrink: 0 }}>
          <InputLabel>{t('region.label')}</InputLabel>
          <Select
            value={region}
            label={t('region.label')}
            onChange={e => handleRegionChange(e.target.value)}
            renderValue={value => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {value ? (
                  <>
                    <Flag region={value} size={20} />
                    {value}
                  </>
                ) : (
                  t('region.all')
                )}
              </Box>
            )}
          >
            <MenuItem value="">{t('region.all')}</MenuItem>
            {regions?.map(r => (
              <MenuItem key={r} value={r}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Flag region={r} size={20} />
                  {r}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Stack>
  );
};
