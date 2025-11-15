import { z } from 'zod';

export const PortalSeasonResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  logoUrl: z.url().nullable()
});

export type Season = z.infer<typeof PortalSeasonResponseSchema>;

export const PortalSeasonsResponseSchema = z.array(PortalSeasonResponseSchema);
