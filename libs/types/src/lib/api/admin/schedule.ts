import { z } from 'zod';

export const AdminJudgingSessionResponseSchema = z.object({
  id: z.string(),
  number: z.number(),
  teamId: z.string().nullable(),
  roomId: z.string(),
  divisionId: z.string(),
  scheduledTime: z.coerce.date()
});

export type JudgingSession = z.infer<typeof AdminJudgingSessionResponseSchema>;

export const AdminRoomResponseSchema = z.object({
  id: z.string(),
  name: z.string()
});

export type Room = z.infer<typeof AdminRoomResponseSchema>;

export const AdminMatchParticipantResponseSchema = z.object({
  id: z.string(),
  teamId: z.string().nullable(),
  tableId: z.string(),
  matchId: z.string()
});

export type MatchParticipant = z.infer<typeof AdminMatchParticipantResponseSchema>;

export const AdminMatchResponseSchema = z.object({
  id: z.string(),
  round: z.number(),
  number: z.number(),
  stage: z.string(),
  scheduledTime: z.coerce.date(),
  participants: z.array(AdminMatchParticipantResponseSchema)
});

export type Match = z.infer<typeof AdminMatchResponseSchema>;

export const AdminTeamScheduleResponseSchema = z.object({
  team: z.object({
    id: z.string(),
    number: z.number(),
    name: z.string(),
    affiliation: z.string().optional()
  }),
  judgingSession: AdminJudgingSessionResponseSchema.nullable(),
  matches: z.array(AdminMatchResponseSchema)
});

export type TeamSchedule = z.infer<typeof AdminTeamScheduleResponseSchema>;

export const AdminJudgingSessionsWithRoomsResponseSchema = z.object({
  sessions: z.array(AdminJudgingSessionResponseSchema),
  rooms: z.array(AdminRoomResponseSchema)
});

export type JudgingSessionsWithRooms = z.infer<typeof AdminJudgingSessionsWithRoomsResponseSchema>;

export const AdminScheduleSwapRequestSchema = z.object({
  teamId1: z.string(),
  teamId2: z.string()
});

export type ScheduleSwapRequest = z.infer<typeof AdminScheduleSwapRequestSchema>;
