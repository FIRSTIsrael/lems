'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import { Grid, Box } from '@mui/material';
import { Team } from '@lems/types/api/portal';
import { TeamListItem } from './team-list-item';
import { TeamPagination } from './team-pagination';
import { RegionSelector } from './region-selector';

export const TeamList: React.FC = () => {
  const searchParams = useSearchParams();
  const pageNumber = Number(searchParams.get('page')) || 1;

  const [regionFilter, setRegionFilter] = useState<string>('all');

  const { data, isLoading } = useSWR<{ teams: Team[]; numberOfPages: number }>(
    `/portal/teams?page=${pageNumber}`,
    {
      suspense: true,
      fallbackData: { teams: [], numberOfPages: 0 }
    }
  );

  const teams = useMemo(() => data?.teams ?? [], [data]);
  const numberOfPages = data?.numberOfPages ?? 0;

  const availableRegions = useMemo(
    () => Array.from(new Set(teams.map(team => team.region))).sort(),
    [teams]
  );

  const filteredTeams = useMemo(
    () => (regionFilter === 'all' ? teams : teams.filter(team => team.region === regionFilter)),
    [teams, regionFilter]
  );

  if (!data || isLoading) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      <Grid size={12}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            alignItems: 'flex-start'
          }}
        >
          <RegionSelector
            regionFilter={regionFilter}
            availableRegions={availableRegions}
            onRegionChange={value => setRegionFilter(value)}
          />
        </Box>
      </Grid>

      <TeamPagination currentPage={pageNumber} totalPages={numberOfPages} />
      {filteredTeams.map(team => (
        <TeamListItem key={team.id} team={team} />
      ))}
      <TeamPagination currentPage={pageNumber} totalPages={numberOfPages} />
    </Grid>
  );
};
