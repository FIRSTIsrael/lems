import { gql, type TypedDocumentNode } from '@apollo/client';

type GetVolunteerEventDataQuery = {
  event: {
    id: string;
    name: string;
    volunteers: Array<{
      divisions: Array<{
        id: string;
        name: string;
        color: string;
      }>;
    }>;
  } | null;
};

type GetVolunteerEventDataQueryVariables = {
  eventId: string;
  userId: string;
};

export const GET_VOLUNTEER_EVENT_DATA_QUERY: TypedDocumentNode<
  GetVolunteerEventDataQuery,
  GetVolunteerEventDataQueryVariables
> = gql`
  query GetVolunteerEventData($eventId: String!, $userId: String!) {
    event(id: $eventId) {
      id
      name
      volunteers(id: $userId) {
        divisions {
          id
          name
          color
        }
      }
    }
  }
`;
