import { ValidationResult } from './utils/validation';
import {
  Award,
  AWARDS,
  AWARD_LIMITS,
  CORE_VALUES_AWARDS,
  OPTIONAL_AWARDS,
  PERSONAL_AWARDS,
  MANDATORY_AWARDS
} from '@lems/shared';

export type {
  Award,
  CoreValuesAward,
  PersonalAward,
  OptionalAwards,
  MandatoryAwards,
  AutomaticAssignmentAward
} from '@lems/shared';

export {
  AWARDS,
  AWARD_LIMITS,
  CORE_VALUES_AWARDS,
  OPTIONAL_AWARDS,
  PERSONAL_AWARDS,
  MANDATORY_AWARDS,
  AUTOMATIC_ASSIGNMENT_AWARDS,
  HIDE_PLACES
} from '@lems/shared';

// Utility types
export interface AwardSchemaItem {
  count: number;
  index: number;
}

export interface AwardSchema {
  [key: string]: AwardSchemaItem;
}

export interface AwardContextState {
  awards: Award[];
  schema: AwardSchema;
  validation: ValidationResult;
  teamCount: number;
  isLoading: boolean;
  isDirty: boolean;
  isNew: boolean;
}

export interface AwardContextActions {
  updateAwardCount: (award: Award, count: number) => void;
  addAward: (award: Award) => void;
  removeAward: (award: Award) => void;
  reorderAwards: (sourceIndex: number, destinationIndex: number) => void;
  saveSchema: () => Promise<void>;
  resetChanges: () => void;
}

export type AwardContextValue = AwardContextState & AwardContextActions;
