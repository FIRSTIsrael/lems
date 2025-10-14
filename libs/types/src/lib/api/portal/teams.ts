import { z } from 'zod';

export const PortalTeamResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.number(),
  logoUrl: z.url().nullable(),
  affiliation: z.string(),
  city: z.string(),
  coordinates: z.string().nullable()
});

export const PortalTeamSummaryResponseSchema = z.object({
  ...PortalTeamResponseSchema.shape,
  lastCompetedSeason: z.string().nullable()
});

export type Team = z.infer<typeof PortalTeamResponseSchema>;

export type TeamSummary = z.infer<typeof PortalTeamSummaryResponseSchema>;

export const PortalTeamsResponseSchema = z.array(PortalTeamResponseSchema);

export const PortalTeamSummariesResponseSchema = z.array(PortalTeamSummaryResponseSchema);
