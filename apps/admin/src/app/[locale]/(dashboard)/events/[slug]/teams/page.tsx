import { getTranslations } from 'next-intl/server';
import { redirect, RedirectType } from 'next/navigation';
import { Stack, Switch, Typography } from '@mui/material';
import { AdminEventResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '../../../../../../lib/fetch';
import RegisterTeamsButton from './components/register-teams-button';

interface EventTeamsPageProps {
  params: { slug: string };
}

export default async function EventTeamsPage({ params }: EventTeamsPageProps) {
  const { slug } = await params;

  const t = await getTranslations('pages.events.teams');

  const result = await apiFetch(`/admin/events/${slug}`, {}, AdminEventResponseSchema);

  if (!result.ok) {
    throw new Error('Failed to load event');
  }

  const { data: event } = result;

  if (!event) {
    redirect('/events', RedirectType.replace);
  }

  return (
    <>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="h1" gutterBottom>
          {t('title', { eventName: event.name })}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography>Unified</Typography>
          <Switch />
          <Typography>Split</Typography>
        </Stack>
      </Stack>
      <RegisterTeamsButton event={event} />
    </>
  );
}
