'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import {
  Grid,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack
} from '@mui/material';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Team } from '@lems/types/api/portal';
import { Flag } from '@lems/shared';
import { TeamListItem } from './team-list-item';
import { TeamPagination } from './team-pagination';
import { TeamSearchInput } from './team-search-input';

export const TeamList: React.FC = () => {
  const t = useTranslations('pages.teams');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageNumber = Number(searchParams.get('page')) || 1;
  const region = searchParams.get('region') || '';
  const searchQuery = searchParams.get('search') || '';
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const { data: regions } = useSWR<string[]>('/portal/teams/regions', {
    fallbackData: []
  });

  const handleRegionChange = (newRegion: string) => {
    const params = new URLSearchParams();
    if (newRegion) params.set('region', newRegion);
    if (searchQuery) params.set('search', searchQuery);
    params.set('page', '1');
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      const params = new URLSearchParams();
      if (region) params.set('region', region);
      if (newSearch) params.set('search', newSearch);
      params.set('page', '1');
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [region, router]
  );

  const handleClearSearch = () => {
    setDebouncedSearch('');
  };

  useEffect(() => {
    setDebouncedSearch(searchQuery);
  }, [searchQuery]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set('page', '1');
    if (region) params.set('region', region);
    if (debouncedSearch) params.set('search', debouncedSearch);
    return params.toString();
  };

  const { data } = useSWR<{ teams: Team[]; numberOfPages: number }>(
    `/portal/teams?${buildQuery()}`,
    {
      fallbackData: { teams: [], numberOfPages: 0 },
      keepPreviousData: true,
      revalidateOnFocus: false
    }
  );

  const teams = data?.teams || [];
  const numberOfPages = data?.numberOfPages || 0;

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TeamSearchInput
          initialValue={searchQuery}
          placeholder={t('search.placeholder')}
          onSearchChange={setDebouncedSearch}
          onClear={handleClearSearch}
          showClearButton={!!debouncedSearch}
        />
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 } }}>
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
      </Stack>
      {teams.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <GroupsIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5, color: 'text.secondary' }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            {t('no-teams.title')}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {t('no-teams.message')}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          <TeamPagination currentPage={pageNumber} totalPages={numberOfPages} />
          {teams.map(team => (
            <TeamListItem key={team.id} team={team} />
          ))}
          <TeamPagination currentPage={pageNumber} totalPages={numberOfPages} />
        </Grid>
      )}
    </>
  );
};
