import { ObjectId } from 'mongodb';
import { AwardNames, JudgingCategory, Status } from '../constants';

type FinalDeliberationStage = 'champions' | 'core-awards' | 'optional-awards' | 'review';

export interface JudgingDeliberation {
  divisionId: ObjectId;
  category?: JudgingCategory;
  isFinalDeliberation?: boolean;
  stage?: FinalDeliberationStage;
  startTime?: Date;
  completionTime?: Date;
  available?: boolean;
  status: Status;
  awards: { [key in AwardNames]?: Array<ObjectId> };
}
