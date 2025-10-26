import { z } from 'zod';

export const LemsUserResponseSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  role: z.string(),
  identifier: z.string().nullable(),
  roleInfo: z.record(z.string(), z.unknown()).nullable()
});

export type LemsUser = z.infer<typeof LemsUserResponseSchema>;
