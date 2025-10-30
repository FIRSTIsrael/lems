import { apiFetch } from '@lems/shared';
import { LemsUser } from '@lems/types/api/lems';
import { getGraphQLWsUrl } from '../../../../lib/api-config';
import { GraphQLWSProvider } from '../../../../lib/graphql';
import { EventProvider } from './components/event-context';
import { fetchEventData } from './graphql/event-data.grqphql';

interface VolunteerLayoutProps {
  children: React.ReactNode;
  searchParams?: Record<string, string | string[]>;
}

export default async function VolunteerLayout({ children, searchParams }: VolunteerLayoutProps) {
  const result = await apiFetch('/lems/auth/verify');

  if (!result.ok) {
    throw new Error('Failed to verify LEMS authentication');
  }

  const { user } = result.data as { ok: boolean; user: LemsUser };
  const { eventId } = user;

  let divisionId: string | undefined;

  // Get the division from query params
  const rawSearchParams = searchParams as Record<string, string | string[] | undefined>;
  const divisionParam = rawSearchParams?.division;
  if (Array.isArray(divisionParam)) {
    divisionId = divisionParam[0];
  } else {
    divisionId = divisionParam;
  }

  try {
    const eventData = await fetchEventData(eventId);

    if (!eventData.event.divisions || eventData.event.divisions.length === 0) {
      throw new Error('No divisions available for this event');
    }

    let currentDivision: { id: string; name: string };

    if (divisionId) {
      const selectedDivision = eventData.event.divisions.find(d => d.id === divisionId);
      if (!selectedDivision) {
        throw new Error(`Division ${divisionId} not found`);
      }
      currentDivision = selectedDivision;
    } else {
      // Default to the first division
      currentDivision = eventData.event.divisions[0];
    }

    // Create event context
    const eventContext = {
      eventId: eventData.event.id,
      eventName: eventData.event.name,
      currentDivision,
      availableDivisions: eventData.event.divisions,
      canSwitchDivisions: eventData.event.divisions.length > 1
    };

    return (
      <EventProvider value={eventContext}>
        <GraphQLWSProvider
          url={getGraphQLWsUrl()}
          divisionId={currentDivision.id}
          userId={user.id}
          roles={[user.role]}
        >
          {children}
        </GraphQLWSProvider>
      </EventProvider>
    );
  } catch (error) {
    console.error('Error in volunteer layout:', error);
    throw error;
  }
}
