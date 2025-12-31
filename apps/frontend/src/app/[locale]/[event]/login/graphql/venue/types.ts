export type GetDivisionVenueQuery = {
  publicDivisionVenue: {
    id: string;
    tables: { id: string; name: string }[];
    rooms: { id: string; name: string }[];
  } | null;
};

export type GetDivisionVenueQueryVariables = {
  id: string;
};
