import type { DeliberationStatus } from '@lems/database';
import type { JudgingCategory } from '@lems/types/judging';
import type { Team } from '../../types';

export interface JudgingDeliberation {
  id: string;
  category: JudgingCategory;
  status: DeliberationStatus;
  startTime?: string;
  picklist: string[];
}

export interface Division {
  id: string;
  name: string;
  color: string;
  teams: Team[];
  judging: {
    deliberation: JudgingDeliberation | null;
  };
}

export interface CategoryDeliberationData {
  division: Division;
}

export interface CategoryDeliberationVars {
  divisionId: string;
  category: JudgingCategory;
}
