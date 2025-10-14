import { Event as DbEvent } from '@lems/database';
import { Event } from '@lems/types/api/lems';

export const makeLemsEventResponse = (event: DbEvent): Event => ({
  id: event.id,
  name: event.name,
  slug: event.slug,
  startDate: event.start_date,
  endDate: event.end_date,
  location: event.location,
  coordinates: event.coordinates ?? null,
  seasonId: event.season_id
});
