import { z } from 'zod';

export const PortalEventResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  location: z.string(),
  coordinates: z.string().optional(),
  seasonId: z.string()
});

export const PortalEventSummaryResponseSchema = z.object({
  ...PortalEventResponseSchema.shape,
  teamsRegistered: z.number(),
  status: z.enum(['upcoming', 'active', 'past'])
});

export type Event = z.infer<typeof PortalEventResponseSchema>;

export type EventSummary = z.infer<typeof PortalEventSummaryResponseSchema>;

export const PortalEventsResponseSchema = z.array(PortalEventResponseSchema);

export const PortalEventSummariesResponseSchema = z.array(PortalEventSummaryResponseSchema);
