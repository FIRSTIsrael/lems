import { ObjectId } from 'mongodb';
import { MissionClauseType, RobotGameMatchType } from '../constants';

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
