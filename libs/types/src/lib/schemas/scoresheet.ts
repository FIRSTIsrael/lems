import { ObjectId } from 'mongodb';
import { MissionClauseType, RobotGameMatchType, Status } from '../constants';

export type ScoresheetStatus = Status | 'waiting-for-head-ref';

export interface MissionClause {
  type: MissionClauseType;
  value: boolean | string | number | null;
}

export interface Mission {
  id: string;
  clauses: MissionClause[];
}

export interface Scoresheet {
  eventId: ObjectId;
  matchId: ObjectId;
  teamId: ObjectId;
  stage: RobotGameMatchType;
  round: number;
  status: ScoresheetStatus;
  data?: {
    missions: Mission[];
    signature: string;
    gp: number;
    score: number;
  };
}
