import { z } from 'zod';

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
