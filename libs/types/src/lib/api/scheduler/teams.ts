import { z } from 'zod';

export const SchedulerTeamResponseSchema = z.object({
  id: z.string(),
  number: z.number(),
});

export type Team = z.infer<typeof SchedulerTeamResponseSchema>;

export const SchedulerTeamsResponseSchema = z.array(SchedulerTeamResponseSchema);