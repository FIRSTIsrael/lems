'use client';

import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Grid } from '@mui/material';
import { Team } from '@lems/types/api/portal';
import { TeamListItem } from './team-list-item';
import { TeamPagination } from './team-pagination';

export const TeamList: React.FC = () => {
  const searchParams = useSearchParams();
  const pageNumber = Number(searchParams.get('division')) || 1;

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
