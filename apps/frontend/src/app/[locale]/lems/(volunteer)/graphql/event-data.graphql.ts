import { gql, type TypedDocumentNode } from '@apollo/client';
import { serverGraphQLQuery } from '../../../../../lib/graphql/server';

type GetVolunteerEventDataQuery = {
  event: {
    id: string;
    name: string;
    divisions: Array<{
      id: string;
      name: string;
    }>;
  } | null;
};

type GetVolunteerEventDataQueryVariables = {
  eventId: string;
};

export const GET_VOLUNTEER_EVENT_DATA_QUERY: TypedDocumentNode<
  GetVolunteerEventDataQuery,
  GetVolunteerEventDataQueryVariables
> = gql`
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

export async function fetchEventData(eventId: string) {
  try {
    const { data, errors } = await serverGraphQLQuery(GET_VOLUNTEER_EVENT_DATA_QUERY, {
      eventId
    });

    if (errors) {
      throw new Error(
        `GraphQL error: ${errors.map((e: { message: string }) => e.message).join(', ')}`
      );
    }

    if (!data?.event) {
      throw new Error('Event not found');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch volunteer event data:', error);
    throw new Error('Failed to load volunteer event data');
  }
}
