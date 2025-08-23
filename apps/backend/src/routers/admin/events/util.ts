import { Event as DbEvent, EventSummary as DbEventSummary } from '@lems/database';
import { Event, EventSummary } from '@lems/types/api/admin';

/**
 * Transforms an event object into a response format.
 * @param event - The event object to transform.
 */
export const makeAdminEventResponse = (event: DbEvent): Event => ({
  id: event.id,
  name: event.name,
  slug: event.slug,
  startDate: event.start_date,
  endDate: event.end_date,
  location: event.location,
  coordinates: event.coordinates,
  seasonId: event.season_id
});

export const makeAdminEventSummaryResponse = (event: DbEventSummary): EventSummary => ({
  id: event.id,
  name: event.name,
  slug: event.slug,
  startDate: new Date(event.date),
  endDate: new Date(event.date),
  location: event.location,
  seasonId: event.season_id,
  divisions: event.divisions,
  teamCount: event.team_count,
  isFullySetUp: event.is_fully_set_up,
  adminIds: event.assigned_admin_ids
});
