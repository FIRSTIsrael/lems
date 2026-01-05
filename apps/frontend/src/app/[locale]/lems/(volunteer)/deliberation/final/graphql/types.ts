import { DeliberationStatus } from '@lems/database';
import { FinalDeliberationStage } from '../types';
import { Team } from '../../types';

export interface FinalDeliberation {
  divisionId: string;
  stage: FinalDeliberationStage;
  status: DeliberationStatus;
  startTime: string | null;
  completionTime: string | null;
  champions: string; // JSON string of Record<number, string>
  robotPerformance: string[];
  innovationProject: string[];
  robotDesign: string[];
  coreValues: string[];
  optionalAwards: string; // JSON string of Record<string, string[]>
  coreAwardsManualEligibility: string[];
  optionalAwardsManualEligibility: string[];
}

export interface Division {
  id: string;
  name: string;
  color: string;
  teams: Team[];
  judging: {
    divisionId: string;
    finalDeliberation: FinalDeliberation | null;
  };
}

export interface FinalDeliberationData {
  division: Division;
}

export interface FinalDeliberationVars {
  divisionId: string;
}
