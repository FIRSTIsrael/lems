'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { Grid, Paper, Typography } from '@mui/material';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Team } from '@lems/types/api/portal';
import { TeamListItem } from './team-list-item';
import { TeamPagination } from './team-pagination';
import { MIN_SEARCH_LENGTH } from './team-search-input';

export const TeamList: React.FC = () => {
  const t = useTranslations('pages.teams');
  const searchParams = useSearchParams();
  const pageNumber = Number(searchParams.get('page')) || 1;
  const region = searchParams.get('region') || '';
  const search = (searchParams.get('search') || '').trim();

  const buildQuery = () => {
    const params = new URLSearchParams();
    params.set('page', pageNumber.toString());
    if (region) params.set('region', region);
    if (search.length >= MIN_SEARCH_LENGTH) params.set('search', search);
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
    const emptyKey = region || search.length >= MIN_SEARCH_LENGTH ? 'no-results' : 'no-teams';
    return (
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <GroupsIcon sx={{ fontSize: 80, mb: 2, opacity: 0.5, color: 'text.secondary' }} />
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            color: 'text.secondary'
          }}
        >
          {t(`${emptyKey}.title`)}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary'
          }}
        >
          {t(`${emptyKey}.message`)}
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
      <TeamPagination currentPage={pageNumber} totalPages={numberOfPages} />
      {teams.map(team => (
        <TeamListItem key={team.id} team={team} />
      ))}
      <TeamPagination currentPage={pageNumber} totalPages={numberOfPages} />
    </Grid>
  );
};
