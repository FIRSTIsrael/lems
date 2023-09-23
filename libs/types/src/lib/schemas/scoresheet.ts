import { ObjectId } from 'mongodb';
import { MissionClauseType, RobotGameMatchType } from '../constants';

export const ScoresheetStatusTypes = [
  'empty',
  'in-progress',
  'waiting-for-head-ref',
  'completed',
  'waiting-for-gp',
  'ready'
] as const;
export type ScoresheetStatus = (typeof ScoresheetStatusTypes)[number];

export interface MissionClause {
  type: MissionClauseType;
  value: boolean | string | number | null;
}

export interface Mission {
  id: string;
  clauses: MissionClause[];
}

export interface Scoresheet {
  team: ObjectId;
  match: ObjectId;
  stage: RobotGameMatchType;
  round: number;
  status: ScoresheetStatus;
  data?: {
    missions: Mission[];
    signature: string;
    gp: { value: string; notes?: string };
    score: number;
  };
}
