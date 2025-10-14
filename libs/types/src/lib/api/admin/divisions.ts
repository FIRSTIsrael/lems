import { z } from 'zod';

export const AdminDivisionResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  eventId: z.string(),
  color: z.string(),
  pitMapUrl: z.url().nullable(),
  hasSchedule: z.boolean(),
  hasAwards: z.boolean(),
  hasUsers: z.boolean(),
  scheduleSettings: z
    .object({
      matchLength: z.number(),
      practiceCycleTime: z.number(),
      rankingCycleTime: z.number(),
      judgingSessionLength: z.number(),
      judgingSessionCycleTime: z.number()
    })
    .nullable()
    .default(null)
});

export type Division = z.infer<typeof AdminDivisionResponseSchema>;

export const AdminDivisionsResponseSchema = z.array(AdminDivisionResponseSchema);
