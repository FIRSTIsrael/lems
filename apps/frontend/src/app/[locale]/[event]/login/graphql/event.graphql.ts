import { gql } from '@apollo/client';
import { serverGraphQLQuery } from '../../../../../lib/graphql/server';

export const GET_EVENT_BY_SLUG_QUERY = gql`
  query GetEventBySlug($slug: String!) {
    event(slug: $slug) {
      id
      slug
      name
      isFullySetUp
    }
  }
`;

export interface EventDetails {
  id: string;
  slug: string;
  name: string;
  isFullySetUp: boolean;
}

export const fetchEventBySlug = async (slug: string): Promise<EventDetails> => {
  const { data, errors } = await serverGraphQLQuery<{ event: EventDetails | null }>(
    GET_EVENT_BY_SLUG_QUERY,
    { slug }
  );

  if (errors) {
    throw new Error(
      `GraphQL error: ${errors.map((e: { message: string }) => e.message).join(', ')}`
    );
  }

  if (!data?.event) {
    throw new Error('Event not found');
  }

  return data.event;
};
