export interface Award {
  id: string;
  name: string;
  placeCount: number;
}

export type QueryData = {
  division?: {
    id: string;
    judging: {
      awards: Array<{
        id: string;
        name: string;
        place: number;
      }>;
    };
  } | null;
};

export type QueryVars = {
  divisionId: string;
};
