'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { Grid, Paper, Typography } from '@mui/material';
import { Groups as GroupsIcon } from '@mui/icons-material';
import { Team } from '@lems/types/api/portal';
import { TeamListItem } from './team-list-item';
import { TeamPagination } from './team-pagination';

export const TeamList: React.FC = () => {
  const t = useTranslations('pages.teams');
  const searchParams = useSearchParams();
  const pageNumber = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = useSWR<{ teams: Team[]; numberOfPages: number }>(
    `/portal/teams?page=${pageNumber}`,
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
    <Grid container spacing={2}>
      <TeamPagination currentPage={pageNumber} totalPages={numberOfPages} />
      {teams.map(team => (
        <TeamListItem key={team.id} team={team} />
      ))}
      <TeamPagination currentPage={pageNumber} totalPages={numberOfPages} />
    </Grid>
  );
};
