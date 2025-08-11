import { z } from 'zod';

export const AdminTeamResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.number(),
  logoUrl: z.string().nullable(),
  affiliation: z.string(),
  city: z.string(),
  coordinates: z.string().nullable()
});

export type AdminTeamResponse = z.infer<typeof AdminTeamResponseSchema>;

export const AdminTeamsResponseSchema = z.array(AdminTeamResponseSchema);

export type AdminTeamsResponse = z.infer<typeof AdminTeamsResponseSchema>;
