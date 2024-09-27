import { ObjectId } from 'mongodb';
import { AnomalyReasons, AwardNames, JudgingCategory, Status } from '../constants';

type FinalDeliberationStage = 'champions' | 'core-awards' | 'optional-awards' | 'review';

export interface DeliberationAnomaly {
  teamId: ObjectId;
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
  status: Status;
  awards: { [key in AwardNames]?: Array<ObjectId> };
}
