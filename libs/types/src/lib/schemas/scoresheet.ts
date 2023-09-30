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
  clauses: Array<MissionClause>;
}

export interface Scoresheet {
  eventId: ObjectId;
  matchId: ObjectId;
  teamId: ObjectId;
  stage: RobotGameMatchType;
  round: number;
  status: ScoresheetStatus;
  data?: {
    missions: Array<Mission>;
    signature: string;
    gp: { value: string; notes?: string };
    score: number;
  };
}
