import { redirect } from 'next/navigation';
import { AdminEventResponseSchema, AdminEventsResponseSchema } from '@lems/types/api/admin';
import { apiFetch } from '@lems/shared';
import { EventProvider } from './components/event-context';

interface EventLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const { slug } = await params;

  const [userEventsResult, eventResult] = await Promise.all([
    apiFetch('/admin/events/me', {}, AdminEventsResponseSchema),
    apiFetch(`/admin/events/slug/${slug}`, {}, AdminEventResponseSchema)
  ]);

  if (!userEventsResult.ok) {
    throw new Error(
      `Failed to fetch user events: ${userEventsResult.status} ${userEventsResult.statusText}`
    );
  }

  if (!eventResult.ok) {
    throw new Error(`Failed to fetch event data: ${eventResult.status} ${eventResult.statusText}`);
  }

  const { data: userEvents } = userEventsResult;
  const { data: event } = eventResult;

  if (!event) {
    redirect('/events');
  }

  if (userEvents && !userEvents.some(userEvent => userEvent.slug === slug)) {
    redirect('/events');
  }

  return <EventProvider value={event}>{children}</EventProvider>;
}
