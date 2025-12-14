import { gql, type TypedDocumentNode } from '@apollo/client';
import type { GetDivisionVenueQuery, GetDivisionVenueQueryVariables } from './types';

export const GET_DIVISION_VENUE_QUERY: TypedDocumentNode<
  GetDivisionVenueQuery,
  GetDivisionVenueQueryVariables
> = gql`
  query GetDivisionVenue($id: String!) {
    division(id: $id) {
      id
      tables {
        id
        name
      }
      rooms {
        id
        name
      }
    }
  }
`;

export type { GetDivisionVenueQuery, GetDivisionVenueQueryVariables };
