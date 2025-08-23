import { z } from 'zod';

export const AdminSeasonResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  logoUrl: z.url().nullable()
});

export type Season = z.infer<typeof AdminSeasonResponseSchema>;

export const AdminSeasonsResponseSchema = z.array(AdminSeasonResponseSchema);
