import { z } from 'zod';

export const AdminJudgingRoomResponseSchema = z.object({
  id: z.string(),
  name: z.string()
});

export type JudgingRoom = z.infer<typeof AdminJudgingRoomResponseSchema>;

export const AdminJudgingRoomsResponseSchema = z.array(AdminJudgingRoomResponseSchema);
