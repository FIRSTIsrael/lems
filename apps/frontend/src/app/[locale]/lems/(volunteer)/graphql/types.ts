export type GetVolunteerEventDataQuery = {
  event: {
    id: string;
    name: string;
    seasonSlug: string | null;
    volunteers: Array<{
      divisions: Array<{
        id: string;
        name: string;
        color: string;
        futureEdition: boolean;
      }>;
    }>;
  } | null;
};

export type GetVolunteerEventDataQueryVariables = {
  eventId: string;
  userId: string;
};
