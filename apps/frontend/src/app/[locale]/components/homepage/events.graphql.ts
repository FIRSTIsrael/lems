import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';

export interface HomepageEvent {
  id: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  isFullySetUp: boolean;
  location: string;
  region: string;
  seasonId: string;
}

// Query result types
type GetEventsQuery = {
  events: HomepageEvent[];
};

type GetEventsQueryVariables = {
  fullySetUp?: boolean;
  startAfter?: string;
  startBefore?: string;
  endAfter?: string;
  endBefore?: string;
};

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
      location
      region
      seasonId
    }
  }
`;
