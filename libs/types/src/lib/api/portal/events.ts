import { z } from 'zod';

export const PortalEventResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  location: z.string(),
  region: z.string(),
  coordinates: z.string().optional(),
  seasonId: z.string()
});

export type Event = z.infer<typeof PortalEventResponseSchema>;

export const PortalEventsResponseSchema = z.array(PortalEventResponseSchema);

export const PortalEventSummaryResponseSchema = z.object({
  ...PortalEventResponseSchema.shape,
  teamsRegistered: z.number(),
  status: z.enum(['upcoming', 'active', 'past']),
  completed: z.boolean(),
  official: z.boolean()
});

export type EventSummary = z.infer<typeof PortalEventSummaryResponseSchema>;

export const PortalEventSummariesResponseSchema = z.array(PortalEventSummaryResponseSchema);

export const PortalEventDetailsDivisionSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  teamCount: z.number()
});

export type EventDetailsDivision = z.infer<typeof PortalEventDetailsDivisionSchema>;

export const PortalEventDetailsDivisionsSchema = z.array(PortalEventDetailsDivisionSchema);

export const PortalEventDetailsResponseSchema = z.object({
  ...PortalEventResponseSchema.shape,
  seasonName: z.string(),
  seasonSlug: z.string(),
  divisions: PortalEventDetailsDivisionsSchema,
  official: z.boolean()
});

export type EventDetails = z.infer<typeof PortalEventDetailsResponseSchema>;

export const PortalEventsDetailsResponseSchema = z.array(PortalEventDetailsResponseSchema);
