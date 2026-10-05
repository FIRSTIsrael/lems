import { z } from 'zod';
import { CoordinatesSchema } from '../coordinates';

export const LemsEventResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  location: z.string(),
  region: z.string(),
  timezone: z.string(),
  coordinates: CoordinatesSchema.nullish(),
  seasonId: z.string(),
  official: z.boolean(),
  futureEdition: z.boolean().optional()
});

export type Event = z.infer<typeof LemsEventResponseSchema>;

export const LemsEventsResponseSchema = z.array(LemsEventResponseSchema);
