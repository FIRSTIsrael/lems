import { z } from 'zod';
import { graphqlFetch } from '@lems/shared';

export const EventDetailsSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  isFullySetUp: z.boolean()
});

export type EventDetailsGraphQLData = z.infer<typeof EventDetailsSchema>;

export const EventDetailsResponseSchema = z.object({
  event: EventDetailsSchema.nullable()
});

export type EventDetailsResponseData = z.infer<typeof EventDetailsResponseSchema>;

const EVENT_DETAILS_QUERY = `
  query GetEventDetails($slug: String!) {
    event(slug: $slug) {
      id
      slug
      name
      isFullySetUp
    }
  }
`;

/**
 * Fetch event details by slug
 */
export const fetchEventBySlug = async (slug: string) => {
  const response = await graphqlFetch(EVENT_DETAILS_QUERY, EventDetailsResponseSchema, { slug });
  if (!response.event) {
    throw new Error('Event not found');
  }
  return response.event;
};
