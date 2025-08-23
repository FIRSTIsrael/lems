import { Division as DbDivision } from '@lems/database';
import { Division } from '@lems/types/api/admin';

/**
 * Transforms a Division object into a response format.
 * @param division - The division object to transform.
 */
export const makeAdminDivisionResponse = (division: DbDivision): Division => ({
  id: division.id,
  name: division.name,
  eventId: division.event_id,
  color: division.color,
  pitMapUrl: division.pit_map_url
});
