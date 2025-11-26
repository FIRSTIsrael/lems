import { Season as DbSeason } from '@lems/database';
import { Season } from '@lems/types/api/admin';

/**
 * Transforms a season object into a response format.
 * @param season - The season object to transform.
 */
export const makeAdminSeasonResponse = (season: DbSeason): Season => ({
  id: season.id,
  slug: season.slug,
  name: season.name,
  startDate: season.start_date,
  endDate: season.end_date,
  logoUrl: season.logo_url ?? null
});
