import { z } from 'zod';
import { Season } from '@lems/database';

export const AdminSeasonResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  logoUrl: z.string().nullable()
});

export type AdminSeasonResponse = z.infer<typeof AdminSeasonResponseSchema>;

export const AdminSeasonsResponseSchema = z.array(AdminSeasonResponseSchema);

export type AdminSeasonsResponse = z.infer<typeof AdminSeasonsResponseSchema>;

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
