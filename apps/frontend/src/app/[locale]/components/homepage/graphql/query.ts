import { gql, type TypedDocumentNode } from '@apollo/client';
import type { GetEventsQuery, GetEventsQueryVariables } from './types';

export const GET_EVENTS_QUERY: TypedDocumentNode<GetEventsQuery, GetEventsQueryVariables> = gql`
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
      region
      seasonName
      official
    }
  }
`;

export type { GetEventsQuery, GetEventsQueryVariables };
