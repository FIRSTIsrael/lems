import { ObjectId } from 'mongodb';
import { MissionClauseType, RobotGameMatchType, Status } from '../constants';

export interface MissionClause {
  type: MissionClauseType;
  value: boolean | string | number;
  points: number;
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
  status: Status;
  data?: {
    missionData: Mission[];
    signature: string;
    gp: number;
    totalPoints: number;
  };
}
