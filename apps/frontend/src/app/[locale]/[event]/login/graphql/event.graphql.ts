import { gql } from '@apollo/client';

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
