import { gql, type TypedDocumentNode } from '@apollo/client';

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
