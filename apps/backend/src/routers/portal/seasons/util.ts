import { Season as DbSeason } from '@lems/database';
import { Season } from '@lems/types/api/portal';

export const makePortalSeasonResponse = (season: DbSeason): Season => ({
  id: season.id,
  slug: season.slug,
  name: season.name,
  startDate: season.start_date,
  endDate: season.end_date,
  logoUrl: season.logo_url
});
