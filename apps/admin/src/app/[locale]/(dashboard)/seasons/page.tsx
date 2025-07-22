import { getTranslations } from 'next-intl/server';
import { Grid, Typography } from '@mui/material';
import { AdminSeasonsResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '../../../../lib/fetch';
import { SeasonCard } from './components/season-card';
import { CreateSeasonCard } from './components/create-season-card';

export default async function SeasonsPage() {
  const t = await getTranslations('pages.seasons');

  const result = await apiFetch(
    '/admin/seasons',
    {
      next: {
        revalidate: 60 // Revalidate every minute
      },
      cache: 'force-cache' // Use cache for this request
    },
    AdminSeasonsResponseSchema
  );

  if (!result.ok) {
    throw new Error(`Failed to fetch seasons: ${result.status} ${result.statusText}`);
  }

  const { data: seasons } = result;

  return (
    <>
      <Typography variant="h1" gutterBottom>
        {t('title')}
      </Typography>
      <Grid container spacing={2}>
        <CreateSeasonCard />
        {seasons.map(season => (
          <SeasonCard key={season.id} season={season} />
        ))}
      </Grid>
    </>
  );
}
