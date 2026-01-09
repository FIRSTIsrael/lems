import { z } from 'zod';

export const PortalDivisionResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().nullable()
});

export type Division = z.infer<typeof PortalDivisionResponseSchema>;

export const PortalAwardResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['PERSONAL', 'TEAM']),
  showPlaces: z.boolean(),
  place: z.number(),
  winner: z.string().optional()
});

const Team = z.object({
  id: z.string(),
  name: z.string(),
  number: z.number(),
  affiliation: z.string(),
  city: z.string(),
  region: z.string(),
  slug: z.string()
});

const Location = z.object({
  id: z.string(),
  name: z.string()
});

export type Award = z.infer<typeof PortalAwardResponseSchema>;

export const PortalAwardsResponseSchema = z.array(PortalAwardResponseSchema);

export const PortalDivisionRobotGameMatchSchema = z.object({
  id: z.string(),
  round: z.number(),
  number: z.number(),
  stage: z.string(),
  scheduledTime: z.coerce.date(),
  participants: z.array(
    z.object({
      team: Team.nullable(),
      table: Location
    })
  )
});

export type RobotGameMatch = z.infer<typeof PortalDivisionRobotGameMatchSchema>;

export const PortalDivisionFieldScheduleSchema = z.array(PortalDivisionRobotGameMatchSchema);

export const PortalDivisionJudgingSessionSchema = z.object({
  id: z.string(),
  number: z.number(),
  team: Team.nullable(),
  room: Location,
  scheduledTime: z.coerce.date()
});

export type JudgingSession = z.infer<typeof PortalDivisionJudgingSessionSchema>;

export const PortalDivisionJudgingScheduleSchema = z.array(PortalDivisionJudgingSessionSchema);

export const PortalScoreboardEntrySchema = z.object({
  team: Team,
  robotGameRank: z.number().nullable(),
  maxScore: z.number().nullable(),
  scores: z.array(z.number().nullable())
});

export type ScoreboardEntry = z.infer<typeof PortalScoreboardEntrySchema>;

export const PortalScoreboardSchema = z.array(PortalScoreboardEntrySchema);
