import { MissionClauseType } from '@lems/types';

export interface MissionClauseSchema {
  type: MissionClauseType;
  default: boolean | string | number;
  options?: Array<string>;
  min?: number;
  max?: number;
  multiSelect?: boolean;
}

export interface MissionSchema {
  id: string;
  clauses: Array<MissionClauseSchema>;
  calculation: (...args: Array<boolean | string | number | string[]>) => number;
  noEquipment?: boolean;
}

export interface ScoresheetSchema {
  season: string;
  missions: Array<MissionSchema>;
  validators: Array<(missions: { [key: string]: Array<boolean | string | number> }) => void>;
}

export class ScoresheetError extends Error {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;

    Object.setPrototypeOf(this, ScoresheetError.prototype);
  }
}
