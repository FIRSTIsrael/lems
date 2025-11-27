import { redirect, RedirectType } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Typography } from '@mui/material';
import { AdminSeasonResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { CreateEventLayout } from './components/create-event-layout';

export default async function CreateEventPage() {
  const t = await getTranslations('pages.events.create');

  const result = await apiFetch('/admin/seasons/current', {}, AdminSeasonResponseSchema);

  if (!result.ok) {
    throw new Error('Failed to load current season');
  }

  const { data: currentSeason } = result;

  if (!currentSeason) {
    redirect('/events', RedirectType.replace);
  }

  return (
    <>
      <Typography variant="h1" gutterBottom>
        {t('title')}
      </Typography>
      <CreateEventLayout />
    </>
  );
}
