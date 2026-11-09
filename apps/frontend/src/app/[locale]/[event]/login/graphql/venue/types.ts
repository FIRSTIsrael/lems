export type GetDivisionVenueQuery = {
  division: {
    id: string;
    tables: { id: string; name: string; pairKey: string; side: string }[];
    rooms: { id: string; name: string }[];
  } | null;
};

export type GetDivisionVenueQueryVariables = {
  id: string;
};
