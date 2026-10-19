import { z } from 'zod';

export const SchedulerLocationResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  pair_key: z.string().nullable().optional(),
  side: z.enum(['A', 'B']).nullable().optional()
});

export type Location = z.infer<typeof SchedulerLocationResponseSchema>;

export const SchedulerLocationsResponseSchema = z.array(SchedulerLocationResponseSchema);
