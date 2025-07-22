import { Season } from '@lems/database';
import { AdminSeasonResponse } from '@lems/types/api/admin';

/**
 * Transforms a season object into a response format.
 * @param {Season} season - The season object to transform.
 */
export const makeAdminSeasonResponse = (season: Season): AdminSeasonResponse => ({
  id: season.id,
  slug: season.slug,
  name: season.name,
  startDate: season.start_date.toISOString(),
  endDate: season.end_date.toISOString(),
  logoUrl: season.logo_url
});
