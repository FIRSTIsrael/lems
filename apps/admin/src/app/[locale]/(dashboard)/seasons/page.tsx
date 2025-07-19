import { getTranslations } from 'next-intl/server';
import { Grid, Typography } from '@mui/material';
import { AdminSeasonsResponseSchema } from '@lems/backend/schemas';
import { SeasonCard } from './season-card';
import { apiFetch } from '../../../../../lib/fetch';

export default async function SeasonsPage() {
  const t = await getTranslations('pages.seasons');

  const { data: seasons } = await apiFetch(
    '/admin/seasons',
    {
      next: {
        revalidate: 60 // Revalidate every minute
      },
      cache: 'force-cache' // Use cache for this request
    },
    AdminSeasonsResponseSchema
  );

  return (
    <>
      <Typography variant="h1">{t('title')}</Typography>
      <Grid container spacing={2} justifyContent="center" alignItems="center">
        {seasons.map(season => (
          <SeasonCard key={season.id} season={season} />
        ))}
      </Grid>
    </>
  );
}
