export type GetVolunteerEventDataQuery = {
  event: {
    id: string;
    name: string;
    volunteers: Array<{
      divisions: Array<{
        id: string;
        name: string;
        color: string;
      }>;
    }>;
  } | null;
};

export type GetVolunteerEventDataQueryVariables = {
  eventId: string;
  userId: string;
};
