export interface Award {
  id: string;
  name: string;
  index: number;
  placeCount: number;
}

export type QueryData = {
  division?: {
    id: string;
    judging: {
      awards: Array<{
        id: string;
        name: string;
        index: number;
        place: number;
      }>;
    };
  } | null;
};

export type QueryVars = {
  divisionId: string;
};
