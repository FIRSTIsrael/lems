import { Event as DbEvent, EventSummary as DbEventSummary } from '@lems/database';
import { Event, EventSummary } from '@lems/types/api/portal';
import dayjs from 'dayjs';

export const makePortalEventResponse = (event: DbEvent): Event => ({
  id: event.id,
  slug: event.slug,
  name: event.name,
  startDate: event.start_date,
  endDate: event.end_date,
  location: event.location,
  coordinates: event.coordinates,
  seasonId: event.season_id
});

export const makePortalEventSummaryResponse = (event: DbEventSummary): EventSummary => {
  const today = dayjs().startOf('day');
  const eventDate = dayjs(event.date).startOf('day');
  const eventStatus = eventDate.isAfter(today) ? 'upcoming' 
    : eventDate.isBefore(today) ? 'past' 
    : 'active';

  return {
    id: event.id,
    slug: event.slug,
    name: event.name,
    startDate: new Date(event.date),
    endDate: new Date(event.date),
    location: event.location,
    seasonId: event.season_id,
    teamsRegistered: event.team_count,
    status: eventStatus
  };
};
