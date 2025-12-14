import { gql, TypedDocumentNode } from '@apollo/client';
import type { GetEventBySlugQueryResult, GetEventBySlugQueryVariables } from './types';

export const GET_EVENT_BY_SLUG_QUERY: TypedDocumentNode<
  GetEventBySlugQueryResult,
  GetEventBySlugQueryVariables
> = gql`
  query GetEventBySlug($slug: String!) {
    event(slug: $slug) {
      id
      slug
      name
      isFullySetUp
    }
  }
`;

export type { GetEventBySlugQueryResult, GetEventBySlugQueryVariables };
export type { EventDetails } from './types';
