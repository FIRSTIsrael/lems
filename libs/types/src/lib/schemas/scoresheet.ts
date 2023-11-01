import { ObjectId } from 'mongodb';
import { MissionClauseType, RobotGameMatchStage } from '../constants';

export const ScoresheetStatusTypes = [
  'empty',
  'in-progress',
  'completed',
  'waiting-for-gp',
  'waiting-for-head-ref',
  'ready'
] as const;
export type ScoresheetStatus = (typeof ScoresheetStatusTypes)[number];

export interface MissionClause {
  type: MissionClauseType;
  value: boolean | string | number | null;
}

export interface Mission {
  id: string;
  clauses: Array<MissionClause>;
}

export interface Scoresheet {
  eventId: ObjectId;
  teamId: ObjectId;
  stage: RobotGameMatchStage;
  round: number;
  status: ScoresheetStatus;
  data?: {
    missions: Array<Mission>;
    signature: string;
    gp: { value: number; notes?: string };
    score: number;
  };
}
