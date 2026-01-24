export interface ScoreboardTeam {
  id: string;
  number: string;
  name: string;
  scores: (number | null)[];
  maxScore: number | null;
  rank: number | null;
}

export interface QueryData {
  division?: {
    id: string;
    teams: {
      id: string;
      number: string;
      name: string;
      scoresheets: {
        id: string;
        round: number;
        status: string;
        data: { score: number } | null;
      }[];
    }[];
  } | null;
}

export interface QueryVars {
  divisionId: string;
}
