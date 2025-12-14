import { gql, type TypedDocumentNode } from '@apollo/client';
import type { GetVolunteerEventDataQuery, GetVolunteerEventDataQueryVariables } from './types';

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
