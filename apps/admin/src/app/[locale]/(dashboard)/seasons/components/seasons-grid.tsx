'use client';

import useSWR from 'swr';
import { Grid } from '@mui/material';
import { Season } from '@lems/types/api/admin';
import { SeasonCard } from './season-card';
import { CreateSeasonCard } from './create-season-card';

interface SeasonsGridProps {
  seasons: Season[];
}

export const SeasonsGrid: React.FC<SeasonsGridProps> = ({ seasons: initialSeasons }) => {
  const { data: seasons } = useSWR<Season[]>('/admin/seasons', {
    fallbackData: initialSeasons
  });

  return (
    <Grid container spacing={2}>
      <CreateSeasonCard />
      {seasons?.map(season => <SeasonCard key={season.id} season={season} />)}
    </Grid>
  );
};
