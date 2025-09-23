import { getTranslations } from 'next-intl/server';
import { Typography } from '@mui/material';
import { AdminSeasonsResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { EventsLayout } from './components/events-layout';

export default async function EventsPage() {
  const t = await getTranslations('pages.events');

  const result = await apiFetch('/admin/seasons', {}, AdminSeasonsResponseSchema);

  if (!result.ok) {
    throw new Error('Failed to load seasons');
  }

  const { data: seasons } = result;

  return (
    <>
      <Typography variant="h1" gutterBottom>
        {t('title')}
      </Typography>
      <EventsLayout seasons={seasons} />
    </>
  );
}
