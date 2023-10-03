import { MissionClauseType } from '@lems/types';

export interface MissionClause {
  type: MissionClauseType;
  default: boolean | string | number;
  options?: Array<string>;
  min?: number;
  max?: number;
}

export interface Mission {
  id: string;
  clauses: Array<MissionClause>;
  calculation: (...args: Array<boolean | string | number>) => number;
}

export interface Scoresheet {
  season: string;
  missions: Array<Mission>;
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
