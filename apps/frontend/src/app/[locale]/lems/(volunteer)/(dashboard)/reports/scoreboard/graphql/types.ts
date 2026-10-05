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
    futureEdition: boolean;
    field: {
      currentStage: string;
      rankingRoundCount: number;
    };
    teams: {
      id: string;
      number: string;
      name: string;
      scoresheets: {
        id: string;
        round: number;
        stage: string;
        status: string;
        data: { score: number } | null;
      }[];
    }[];
  } | null;
}

export interface QueryVars {
  divisionId: string;
}
