export interface Award {
  id: string;
  name: string;
  placeCount: number;
  description: string | null;
}

export type QueryData = {
  division?: {
    id: string;
    awards: Array<{
      id: string;
      name: string;
      place: number;
      description: string | null;
    }>;
  } | null;
};

export type QueryVars = {
  divisionId: string;
};
