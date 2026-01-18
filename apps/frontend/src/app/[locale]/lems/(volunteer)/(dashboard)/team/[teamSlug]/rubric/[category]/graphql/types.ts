import { RubricStatus } from '@lems/database';

export type RubricFieldValue = {
  value: 1 | 2 | 3 | 4 | null;
  notes?: string;
};

type RubricFeedback = {
  greatJob?: string;
  thinkAbout?: string;
};

export interface RubricData {
  awards?: Record<string, boolean>;
  fields: Record<string, RubricFieldValue>;
  feedback?: RubricFeedback;
}

export type JudgingCategoryGraphQL = 'innovation_project' | 'robot_design' | 'core_values';

export interface RubricItem {
  id: string;
  category: JudgingCategoryGraphQL;
  status: RubricStatus;
  data?: RubricData;
}

export interface PageData {
  awards: { id: string; name: string }[];
  rubric: RubricItem;
}

export type QueryResult = {
  division: {
    judging: {
      awards: { id: string; name: string }[];
      rubrics: RubricItem[];
    };
  };
};

export type QueryVariables = {
  divisionId: string;
  teamId: string;
  category: 'innovation_project' | 'robot_design' | 'core_values';
};

// Layout query types
export type GetTeamSessionQueryData = {
  division?: {
    id: string;
    judging: {
      sessions: Array<{ id: string; number: number; status: string; room: { id: string } }>;
    };
  } | null;
};
export type GetTeamSessionQueryVars = { divisionId: string; teamId: string };
