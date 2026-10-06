import { apiFetch } from '@lems/shared';
import { LemsUser } from '@lems/types/api/lems';
import { getClient } from '../../../../lib/graphql/ssr-client';
import { GET_VOLUNTEER_EVENT_DATA_QUERY } from './graphql';
import { EventProvider } from './components/event-context';
import { UserProvider } from './components/user-context';

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

  let eventData;
  try {
    const client = getClient();
    const queryResult = await client.query({
      query: GET_VOLUNTEER_EVENT_DATA_QUERY,
      variables: { eventId, userId: user.id }
    });
    eventData = queryResult.data;
  } catch (error) {
    console.error('Error in volunteer layout:', error);
    throw error;
  }

  if (!eventData?.event) {
    throw new Error('Event not found');
  }

  const volunteerData = eventData.event.volunteers[0];
  if (!volunteerData || !volunteerData.divisions || volunteerData.divisions.length === 0) {
    throw new Error('Volunteer has no assigned divisions');
  }

  return (
    <UserProvider value={user}>
      <EventProvider
        eventId={eventData.event.id}
        eventName={eventData.event.name}
        seasonSlug={eventData.event.seasonSlug}
        divisions={volunteerData.divisions}
      >
        {children}
      </EventProvider>
    </UserProvider>
  );
}
