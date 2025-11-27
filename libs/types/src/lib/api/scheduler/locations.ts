import { z } from 'zod';

export const SchedulerLocationResponseSchema = z.object({
  id: z.string(),
  name: z.string()
});

export type Location = z.infer<typeof SchedulerLocationResponseSchema>;

export const SchedulerLocationsResponseSchema = z.array(SchedulerLocationResponseSchema);
