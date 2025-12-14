export type GetTeamDataQuery = {
  division: {
    id: string;
    teams: Array<{
      id: string;
      name: string;
      number: number;
      affiliation: string;
      city: string;
      logoUrl: string;
      slug: string;
      arrived: boolean;
    }>;
  } | null;
};

export type GetTeamDataQueryVariables = {
  divisionId: string;
  teamSlug: string;
};
