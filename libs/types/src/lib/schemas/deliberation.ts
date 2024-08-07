import { ObjectId } from 'mongodb';
import { AwardNames, JudgingCategory, Status } from '../constants';

export interface DeliberationAward {
  awardName: AwardNames;
  pickList: Array<ObjectId>;
}

export interface JudgingDeliberation {
  divisionId: ObjectId;
  category?: JudgingCategory;
  isFinalDeliberation?: boolean;
  startTime?: Date;
  status: Status;
  awards: Array<DeliberationAward>;
}
