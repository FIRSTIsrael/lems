import { Event as DbEvent } from '@lems/database';
import { Event } from '@lems/types/api/admin';

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
