/**
 * Represents the valid value types for a scoresheet mission clause.
 * - `boolean`: Used for simple true/false clauses
 * - `string`: Used for single-select enum clauses
 * - `number`: Used for numeric input clauses
 * - `string[]`: Used for multi-select enum clauses
 * - `null`: Used when a clause value is not yet set
 */
export type ScoresheetClauseValue = boolean | string | number | string[] | null;

export type MissionClauseType = 'boolean' | 'enum' | 'number';

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
  calculation: (...args: Array<ScoresheetClauseValue>) => number;
  noEquipment?: boolean;
}

export interface ScoresheetSchema {
  _version: string;
  missions: Array<MissionSchema>;
  validators: Array<(missions: { [key: string]: Array<ScoresheetClauseValue> }) => void>;
}

export class ScoresheetError extends Error {
  id: string;

  constructor(id: string) {
    super();
    this.id = id;

    Object.setPrototypeOf(this, ScoresheetError.prototype);
  }
}
