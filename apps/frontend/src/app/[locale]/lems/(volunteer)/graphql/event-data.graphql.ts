import { z } from 'zod';
import { graphqlFetch } from '@lems/shared';

const VOLUNTEER_EVENT_DATA_QUERY = `
  query GetVolunteerEventData($eventId: String!) {
    event(id: $eventId) {
      id
      name
      divisions {
        id
        name
      }
    }
  }
`;

const EventDataSchema = z.object({
  event: z.object({
    id: z.string(),
    name: z.string(),
    divisions: z.array(
      z.object({
        id: z.string(),
        name: z.string()
      })
    )
  })
});

type EventData = z.infer<typeof EventDataSchema>;

export async function fetchEventData(eventId: string): Promise<EventData> {
  try {
    const data = await graphqlFetch(VOLUNTEER_EVENT_DATA_QUERY, EventDataSchema, { eventId });
    return data;
  } catch (error) {
    console.error('Failed to fetch volunteer event data:', error);
    throw new Error('Failed to load volunteer event data');
  }
}
