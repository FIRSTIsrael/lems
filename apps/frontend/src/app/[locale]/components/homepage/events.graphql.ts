import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';
import { serverGraphQLQuery } from '../../../../lib/graphql/server';

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
    }
  }
`;

export interface HomepageEvent {
  id: string;
  name: string;
  slug: string;
  startDate: string;
  endDate: string;
  isFullySetUp: boolean;
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

export const fetchEvents = async (filters?: GetEventsQueryVariables): Promise<HomepageEvent[]> => {
  const { data, errors } = await serverGraphQLQuery(GET_EVENTS_QUERY, filters);

  if (errors) {
    throw new Error(
      `GraphQL error: ${errors.map((e: { message: string }) => e.message).join(', ')}`
    );
  }

  return data?.events ?? [];
};
