import { JudgingCategory } from '@lems/types/judging';

export interface RubricExportData {
  id: string;
  category: JudgingCategory;
  status: string;
  data: {
    awards: Record<string, boolean>;
    fields: Record<string, number>;
    feedback: {
      greatJob: string;
      thinkAbout: string;
    };
  };
}

export interface DivisionDataRubrics {
  id: string;
  judging: {
    rubrics: RubricExportData[];
    awards: Array<{
      id: string;
      name: string;
    }>;
  };
}

export interface TeamDataRubrics {
  id: string;
  number: number;
}

export interface GetAllRubricsExportQueryResult {
  division: DivisionDataRubrics;
  team: TeamDataRubrics;
}

export interface GetAllRubricsExportQueryVariables {
  divisionId: string;
  teamId: string;
}

export interface ParsedRubricsExportData {
  rubrics: RubricExportData[];
  awards: Array<{
    id: string;
    name: string;
  }>;
  team: TeamDataRubrics;
}
