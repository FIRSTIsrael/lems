import { redirect, RedirectType } from 'next/navigation';
import { Box } from '@mui/material';
import { AdminEventResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '../../../../../../lib/fetch';
import EventTeamsContent from './components/event-teams-content';

interface EventTeamsPageProps {
  params: { slug: string };
}

export default async function EventTeamsPage({ params }: EventTeamsPageProps) {
  const { slug } = await params;

  const result = await apiFetch(`/admin/events/${slug}`, {}, AdminEventResponseSchema);

  if (!result.ok) {
    throw new Error('Failed to load event');
  }

  const { data: event } = result;

  if (!event) {
    redirect('/events', RedirectType.replace);
  }

  return (
    <Box
      sx={{
        height: 'calc(100vh - 40px)',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <EventTeamsContent event={event} />
    </Box>
  );
}
