import { DeliberationStatus } from '@lems/database';
import { FinalDeliberationStage } from '../types';
import { Team } from '../../types';

export interface FinalJudgingDeliberation {
  divisionId: string;
  stage: FinalDeliberationStage;
  status: DeliberationStatus;
  startTime: string | null;
  completionTime: string | null;
  champions: Record<number, string>;
  innovationProject: string[];
  robotDesign: string[];
  coreValues: string[];
  optionalAwards: Record<string, string[]>;
  coreAwardsManualEligibility: string[];
  optionalAwardsManualEligibility: string[];
}

interface Award {
  id: string;
  name: string;
  index: number;
  place: number;
  type: 'PERSONAL' | 'TEAM';
  isOptional: boolean;
  allowNominations: boolean;
  automaticAssignment: boolean;
  showPlaces: boolean;
  winner?: TeamWinner | PersonalWinner;
}

export interface TeamWinner {
  team: Team;
}

interface PersonalWinner {
  name: string;
}

interface CategoryDeliberation {
  picklist: string[];
}

export interface Division {
  id: string;
  name: string;
  color: string;
  teams: Team[];
  judging: {
    divisionId: string;
    awards: Award[];
    innovationProjectDeliberation: CategoryDeliberation;
    robotDesignDeliberation: CategoryDeliberation;
    coreValuesDeliberation: CategoryDeliberation;
    finalDeliberation: FinalJudgingDeliberation;
    advancementPercentage: number | null;
  };
}

export interface FinalDeliberationData {
  division: Division;
}

export interface FinalDeliberationVars {
  divisionId: string;
}
