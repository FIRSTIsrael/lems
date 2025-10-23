import { z } from 'zod';
import { PortalTeamsResponseSchema } from './teams';

export const PortalDivisionAwardSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['PERSONAL', 'TEAM']),
  place: z.number(),
  winner: z.string().optional()
});

export type Award = z.infer<typeof PortalDivisionAwardSchema>;

export const PortalDivisionAwardsSchema = z.array(PortalDivisionAwardSchema);

// Field
export const PortalDivisionTableSchema = z.object({
  id: z.string(),
  name: z.string()
});

export type RobotGameTable = z.infer<typeof PortalDivisionTableSchema>;

export const PortalDivisionTablesSchema = z.array(PortalDivisionTableSchema);

export const PortalDivisionRobotGameMatchSchema = z.object({
  id: z.string(),
  round: z.number(),
  number: z.number(),
  stage: z.string(),
  scheduledTime: z.coerce.date(),
  participants: z.array(
    z.object({
      teamId: z.string().nullable(),
      tableId: z.string()
    })
  )
});

export type RobotGameMatch = z.infer<typeof PortalDivisionRobotGameMatchSchema>;

export const PortalDivisionFieldScheduleSchema = z.array(PortalDivisionRobotGameMatchSchema);

// Judging
export const PortalDivisionRoomSchema = z.object({
  id: z.string(),
  name: z.string()
});

export type JudgingRoom = z.infer<typeof PortalDivisionRoomSchema>;

export const PortalDivisionRoomsSchema = z.array(PortalDivisionRoomSchema);

export const PortalDivisionJudgingSessionSchema = z.object({
  id: z.string(),
  number: z.number(),
  teamId: z.string(),
  roomId: z.string(),
  scheduledTime: z.coerce.date()
});

export type JudgingSession = z.infer<typeof PortalDivisionJudgingSessionSchema>;

export const PortalDivisionJudgingScheduleSchema = z.array(PortalDivisionJudgingSessionSchema);

export const PortalDivisionScoreboardEntrySchema = z.object({
  teamId: z.string(),
  robotGameRank: z.number().nullable(),
  maxScore: z.number().nullable(),
  scores: z.array(z.number()).nullable()
});

export type DivisionScoreboardEntry = z.infer<typeof PortalDivisionScoreboardEntrySchema>;

export const PortalDivisionScoreboardSchema = z.array(PortalDivisionScoreboardEntrySchema);

export const PortalDivisionDataResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  teams: PortalTeamsResponseSchema,
  awards: PortalDivisionAwardsSchema,
  fieldSchedule: PortalDivisionFieldScheduleSchema,
  judgingSchedule: PortalDivisionJudgingScheduleSchema,
  rooms: PortalDivisionRoomsSchema,
  tables: PortalDivisionTablesSchema,
  scoreboard: PortalDivisionScoreboardSchema
});

export type DivisionData = z.infer<typeof PortalDivisionDataResponseSchema>;
