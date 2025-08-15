import { redirect, RedirectType } from 'next/navigation';
import { Typography } from '@mui/material';
import { AdminEventResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '../../../../../../lib/fetch';

interface CreateEventPageProps {
  params: {
    slug: string;
  };
}

export default async function CreateEventPage({ params: { slug } }: CreateEventPageProps) {
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
      <Typography variant="h1" gutterBottom>
        {event.name}
      </Typography>
    </>
  );
}
