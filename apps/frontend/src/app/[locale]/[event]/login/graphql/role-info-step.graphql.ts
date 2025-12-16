import { gql } from '@apollo/client';
import type { TypedDocumentNode } from '@apollo/client';

type GetDivisionVenueQuery = {
  divisionVenue: {
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
    divisionVenue(id: $id) {
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
