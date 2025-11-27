import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';

type GetDivisionVenueQuery = {
  division: {
    id: string;
    tables: { id: string; name: string }[];
    rooms: { id: string; name: string }[];
  } | null;
};

type GetDivisionVenueQueryVariables = {
  id: string;
};

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
