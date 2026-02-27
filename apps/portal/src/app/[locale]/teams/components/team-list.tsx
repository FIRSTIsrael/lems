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
  TextField,
  InputAdornment,
  IconButton,
  Stack
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { Team } from '@lems/types/api/portal';
import { Flag } from '@lems/shared';
import { TeamListItem } from './team-list-item';
import { TeamPagination } from './team-pagination';

export const TeamList: React.FC = () => {
  const t = useTranslations('pages.teams');
  const router = useRouter();
  const searchParams = useSearchParams();
  const pageNumber = Number(searchParams.get('page')) || 1;
  const region = searchParams.get('region') || '';
  const searchQuery = searchParams.get('search') || '';
  const [searchInput, setSearchInput] = useState(searchQuery);

  const { data: regions } = useSWR<string[]>('/portal/teams/regions', {
    fallbackData: []
  });

  const handleRegionChange = (newRegion: string) => {
    const params = new URLSearchParams();
    if (newRegion) params.set('region', newRegion);
    if (searchQuery) params.set('search', searchQuery);
    params.set('page', '1');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSearchChange = useCallback(
    (newSearch: string) => {
      const params = new URLSearchParams();
      if (region) params.set('region', region);
      if (newSearch) params.set('search', newSearch);
      params.set('page', '1');
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [region, router]
  );

  const handleClearSearch = () => {
    setSearchInput('');
    handleSearchChange('');
  };

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        handleSearchChange(searchInput);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, handleSearchChange]);

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set('page', pageNumber.toString());
    if (region) params.set('region', region);
    if (searchQuery) params.set('search', searchQuery);
    return params.toString();
  };

  const { data, isLoading } = useSWR<{ teams: Team[]; numberOfPages: number }>(
    `/portal/teams?${buildQuery()}`,
    {
      suspense: true,
      fallbackData: { teams: [], numberOfPages: 0 }
    }
  );

  if (!data || isLoading) {
    return null;
  }

  const teams = data.teams;
  const numberOfPages = data.numberOfPages;

  if (teams.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <GroupsIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5, color: 'text.secondary' }} />
        <Typography variant="h5" gutterBottom color="text.secondary">
          {t('no-teams.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('no-teams.message')}
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          size="small"
          placeholder={t('search.placeholder')}
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchInput && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch} edge="end">
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
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
      <Grid container spacing={2}>
        <TeamPagination currentPage={pageNumber} totalPages={numberOfPages} />
        {teams.map(team => (
          <TeamListItem key={team.id} team={team} />
        ))}
        <TeamPagination currentPage={pageNumber} totalPages={numberOfPages} />
      </Grid>
    </>
  );
};
