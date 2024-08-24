import { ObjectId } from 'mongodb';
import { AwardNames, JudgingCategory, Status } from '../constants';
export interface JudgingDeliberation {
  divisionId: ObjectId;
  category?: JudgingCategory;
  isFinalDeliberation?: boolean;
  startTime?: Date;
  status: Status;
  awards: { [key in AwardNames]?: Array<ObjectId> };
}
