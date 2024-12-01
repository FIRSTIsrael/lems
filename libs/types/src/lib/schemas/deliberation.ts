import { ObjectId } from 'mongodb';
import { AnomalyReasons, AwardNames, JudgingCategory, Status } from '../constants';

export const FinalDeliberationStages = [
  'champions',
  'core-awards',
  'optional-awards',
  'review'
] as const;
export type FinalDeliberationStage = (typeof FinalDeliberationStages)[number];

export interface DeliberationAnomaly {
  teamId: ObjectId;
  category: JudgingCategory;
  reason: AnomalyReasons;
}

export interface JudgingDeliberation {
  divisionId: ObjectId;
  category?: JudgingCategory;
  isFinalDeliberation?: boolean;
  stage?: FinalDeliberationStage;
  startTime?: Date;
  completionTime?: Date;
  available?: boolean;
  anomalies?: Array<DeliberationAnomaly>;
  disqualifications: Array<ObjectId>;
  manualEligibility?: Array<ObjectId>;
  status: Status;
  awards: { [key in AwardNames]?: Array<ObjectId> };
}
