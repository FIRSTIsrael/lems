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

export const PortalTeamEventResultSchema = z.object({
  eventName: z.string(),
  eventSlug: z.string(),
  awards: z.array(z.object({ name: z.string(), place: z.number().nullable() })),
  matches: z.array(z.object({ number: z.number(), score: z.number() })),
  robotGameRank: z.number()
});

export type TeamEventResult = z.infer<typeof PortalTeamEventResultSchema>;

export const PortalTeamEventResultsSchema = z.array(PortalTeamEventResultSchema);

export const PortalTeamInEventDataResponseSchema = z.object({
  team: PortalTeamResponseSchema,
  eventName: z.string(),
  eventSlug: z.string(),
  divisionName: z.string(),
  awards: z.array(z.object({
    name: z.string(),
    place: z.number()
  })),
  matches: z.array(z.object({
    number: z.number(),
    stage: z.string(),
    scheduledTime: z.coerce.date(),
    tableName: z.string()
  })),
  judgingSessions: z.array(z.object({
    number: z.number(),
    roomName: z.string(),
    scheduledTime: z.coerce.date()
  })),
  scoreboard: z.object({
    robotGameRank: z.number().nullable(),
    maxScore: z.number().nullable(),
    scores: z.array(z.number()).nullable()
  }).nullable()
});

export type TeamInEventData = z.infer<typeof PortalTeamInEventDataResponseSchema>;
