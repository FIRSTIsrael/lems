import { z } from 'zod';

export const AdminEventResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  location: z.string(),
  coordinates: z.string().nullable(),
  seasonId: z.string()
});

export const AdminEventSummaryResponseSchema = z.object({
  ...AdminEventResponseSchema.shape,
  divisions: z.array(z.object({ id: z.string(), name: z.string(), color: z.string() })),
  teamCount: z.number(),
  isFullySetUp: z.boolean(),
  adminIds: z.array(z.string())
});

export type Event = z.infer<typeof AdminEventResponseSchema>;

export type EventSummary = z.infer<typeof AdminEventSummaryResponseSchema>;

export const AdminEventsResponseSchema = z.array(AdminEventResponseSchema);

export const AdminSummarizedEventsResponseSchema = z.array(AdminEventSummaryResponseSchema);

export const AdminEventSettingsResponseSchema = z.object({
  completed: z.boolean(),
  published: z.boolean(),
  advancementPercent: z.number().min(0).max(100)
});

export type EventSettings = z.infer<typeof AdminEventSettingsResponseSchema>;