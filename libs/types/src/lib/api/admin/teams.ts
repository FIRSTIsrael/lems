import { z } from 'zod';

export const AdminTeamResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.number(),
  logoUrl: z.url().nullable(),
  affiliation: z.string(),
  city: z.string(),
  coordinates: z.string().nullable(),
  active: z.boolean().optional(),
  region: z.string(),

  // Optional computed fields
  deletable: z.boolean().optional()
});

export type Team = z.infer<typeof AdminTeamResponseSchema>;

export const AdminTeamWithDivisionResponseSchema = AdminTeamResponseSchema.extend({
  division: z.object({
    id: z.string(),
    name: z.string(),
    color: z.string()
  })
});

export type TeamWithDivision = z.infer<typeof AdminTeamWithDivisionResponseSchema>;

export const AdminTeamsResponseSchema = z.array(AdminTeamResponseSchema);

export const AdminTeamsImportResponseSchema = z.object({
  created: z.array(AdminTeamResponseSchema),
  updated: z.array(AdminTeamResponseSchema)
});
