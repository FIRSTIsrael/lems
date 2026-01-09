import { z } from 'zod';
import { PortalSeasonResponseSchema } from './seasons';
import { PortalDivisionResponseSchema } from './divisions';

export const PortalTeamResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.number(),
  logoUrl: z.url().nullable(),
  affiliation: z.string(),
  city: z.string(),
  coordinates: z.string().nullable(),
  region: z.string(),
  slug: z.string()
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
  published: z.boolean(),
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

export const TeamRobotGameMatchSchema = z.object({
  id: z.string(),
  round: z.number(),
  number: z.number(),
  stage: z.string(),
  scheduledTime: z.coerce.date(),
  table: z.object({
    id: z.string(),
    name: z.string()
  })
});

export type TeamRobotGameMatch = z.infer<typeof TeamRobotGameMatchSchema>;

export const AgendaEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  startTime: z.coerce.date(),
  duration: z.number(),
  divisionId: z.string(),
  location: z.string().nullable()
});

export type AgendaEvent = z.infer<typeof AgendaEventSchema>;

export const TeamJudgingSessionSchema = z.object({
  id: z.string(),
  number: z.number(),
  scheduledTime: z.coerce.date(),
  room: z.object({
    id: z.string(),
    name: z.string()
  })
});

export type TeamJudgingSession = z.infer<typeof TeamJudgingSessionSchema>;

export const TeamRobotPerformanceSchema = z.object({
  scores: z.array(z.number()),
  highestScore: z.number(),
  robotGameRank: z.number()
});

export type TeamRobotPerformance = z.infer<typeof TeamRobotPerformanceSchema>;

export const PortalTeamAtEventDataSchema = z.object({
  team: PortalTeamResponseSchema,
  event: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string()
  }),
  division: PortalDivisionResponseSchema
});

export type TeamAtEventData = z.infer<typeof PortalTeamAtEventDataSchema>;
