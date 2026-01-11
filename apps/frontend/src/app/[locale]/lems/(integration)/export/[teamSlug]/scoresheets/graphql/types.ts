export interface ScoresheetExportData {
  id: string;
  slug: string;
  stage: string;
  round: number;
  status: string;
  escalated: boolean;
  data: {
    missions: Record<string, { points: number; value: number }>;
    signature: string;
    score: number;
  };
}

export interface DivisionDataScoresheets {
  id: string;
  judging: {
    scoresheets: ScoresheetExportData[];
  };
}

export interface TeamDataScoresheets {
  id: string;
  number: number;
}

export interface GetAllScoresheetsExportQueryResult {
  division: DivisionDataScoresheets;
  team: TeamDataScoresheets;
}

export interface GetAllScoresheetsExportQueryVariables {
  divisionId: string;
  teamId: string;
}

export interface ParsedScoresheetsExportData {
  scoresheets: ScoresheetExportData[];
  team: TeamDataScoresheets;
}
