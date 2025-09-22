import { Award } from '@lems/types/fll';
import { ValidationResult } from './utils/validation';

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
  isLoadedFromDatabase: boolean;
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
