import { z } from 'zod';
import { PortalSeasonResponseSchema } from './seasons';

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
  lastCompetedSeason: PortalSeasonResponseSchema
});

export type Team = z.infer<typeof PortalTeamResponseSchema>;

export type TeamSummary = z.infer<typeof PortalTeamSummaryResponseSchema>;

export const PortalTeamsResponseSchema = z.array(PortalTeamResponseSchema);

export const PortalTeamSummariesResponseSchema = z.array(PortalTeamSummaryResponseSchema);

export const PortalTeamEventResultSchema = z.object({
  eventName: z.string(),
  eventSlug: z.string(),
  results: z
    .object({
      awards: z.array(
        z.object({
          name: z.string(),
          place: z.number().nullable()
        })
      ),
      matches: z.array(
        z.object({
          number: z.number(),
          score: z.number()
        })
      ),
      robotGameRank: z.number()
    })
    .nullable()
});

export type TeamEventResult = z.infer<typeof PortalTeamEventResultSchema>;

export const PortalTeamEventResultsSchema = z.array(PortalTeamEventResultSchema);

export const PortalTeamAtEventDataResponseSchema = z.object({
  team: PortalTeamResponseSchema,
  event: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string()
  }),
  division: z.object({
    id: z.string(),
    name: z.string()
  }),
  awards: z.array(
    z.object({
      name: z.string(),
      place: z.number()
    })
  ),
  matches: z.array(
    z.object({
      number: z.number(),
      stage: z.string(),
      scheduledTime: z.coerce.date(),
      table: z.object({ id: z.string(), name: z.string() })
    })
  ),
  judgingSession: z.object({
    number: z.number(),
    scheduledTime: z.coerce.date(),
    room: z.object({ id: z.string(), name: z.string() })
  }),
  scoreboard: z
    .object({
      rank: z.number().nullable(),
      maxScore: z.number().nullable(),
      scores: z.array(z.number()).nullable()
    })
    .nullable()
});

export type TeamAtEventData = z.infer<typeof PortalTeamAtEventDataResponseSchema>;
