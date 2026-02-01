import { z } from 'zod';

export const LemsEventResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  location: z.string(),
  region: z.string(),
  coordinates: z.string().nullish(),
  seasonId: z.string(),
  official: z.boolean()
});

export type Event = z.infer<typeof LemsEventResponseSchema>;

export const LemsEventsResponseSchema = z.array(LemsEventResponseSchema);
