import { z } from 'zod';
import { graphqlFetch } from '@lems/shared';

export const HomepageEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  isFullySetUp: z.boolean()
});

export type HomepageEventGraphQLData = z.infer<typeof HomepageEventSchema>;

export const EventsResponseSchema = z.object({
  events: z.array(HomepageEventSchema)
});

export type HomepageEventsResponseData = z.infer<typeof EventsResponseSchema>;

const EVENTS_QUERY = `
  query GetEvents(
    $fullySetUp: Boolean
    $startAfter: String
    $startBefore: String
    $endAfter: String
    $endBefore: String
  ) {
    events(
      fullySetUp: $fullySetUp
      startAfter: $startAfter
      startBefore: $startBefore
      endAfter: $endAfter
      endBefore: $endBefore
    ) {
      id
      name
      slug
      startDate
      endDate
      isFullySetUp
    }
  }
`;

export interface EventsQueryVariables {
  fullySetUp?: boolean;
  startAfter?: string;
  startBefore?: string;
  endAfter?: string;
  endBefore?: string;
  [key: string]: unknown;
}

/**
 * Fetch events with optional filters
 */
const fetchEvents = (variables?: EventsQueryVariables) =>
  graphqlFetch(EVENTS_QUERY, EventsResponseSchema, variables);

/**
 * Fetch events that are currently live
 */
export const fetchLiveEvents = (now: string, oneDayAgo: string) =>
  fetchEvents({
    fullySetUp: true,
    startAfter: oneDayAgo,
    startBefore: now,
    endAfter: now
  });

/**
 * Fetch upcoming events within a date range
 */
export const fetchUpcomingEvents = (startAfter: string, endBefore: string) =>
  fetchEvents({
    fullySetUp: true,
    startAfter,
    endBefore
  });
