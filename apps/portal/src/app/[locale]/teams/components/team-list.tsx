'use client';

import { useSearchParams, useRouter } from 'next/navigation';
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
  MenuItem
} from '@mui/material';
import { Groups as GroupsIcon } from '@mui/icons-material';
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

  const { data: regions } = useSWR<string[]>('/portal/teams/regions', {
    fallbackData: []
  });

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set('page', pageNumber.toString());
    if (region) params.set('region', region);
    return params.toString();
  };

  const { data, isLoading } = useSWR<{ teams: Team[]; numberOfPages: number }>(
    `/portal/teams?${buildQuery()}`,
    {
      suspense: true,
      fallbackData: { teams: [], numberOfPages: 0 }
    }
  );

  const handleRegionChange = (newRegion: string) => {
    const params = new URLSearchParams();
    if (newRegion) params.set('region', newRegion);
    params.set('page', '1');
    router.replace(`?${params.toString()}`, { scroll: false });
  };

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
      <Box sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
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
