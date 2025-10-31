import { apiFetch } from '@lems/shared';
import { LemsUser } from '@lems/types/api/lems';
import { fetchEventData } from './graphql/event-data.graphql';
import { EventProvider } from './components/event-context';

interface VolunteerLayoutProps {
  children: React.ReactNode;
}

export default async function VolunteerLayout({ children }: VolunteerLayoutProps) {
  const result = await apiFetch('/lems/auth/verify');

  if (!result.ok) {
    throw new Error('Failed to verify LEMS authentication');
  }

  const { user } = result.data as { ok: boolean; user: LemsUser };
  const { eventId } = user;

  try {
    const eventData = await fetchEventData(eventId);

    if (!eventData.event) {
      throw new Error('Event not found');
    }

    if (!eventData.event.divisions || eventData.event.divisions.length === 0) {
      throw new Error('No divisions available for this event');
    }

    return (
      <EventProvider
        eventId={eventData.event.id}
        eventName={eventData.event.name}
        divisions={eventData.event.divisions}
      >
        {children}
      </EventProvider>
    );
  } catch (error) {
    console.error('Error in volunteer layout:', error);
    throw error;
  }
}
