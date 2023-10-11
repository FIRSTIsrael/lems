import { ObjectId } from 'mongodb';
import { RubricStatus, Status } from '../constants';

export interface JudgingSession {
  number: number;
  team: ObjectId;
  room: ObjectId;
  status: Status;
  scheduledTime: Date;
  startTime?: Date;
  coreValues: RubricStatus;
  innovationProject: RubricStatus;
  robotDesign: RubricStatus;
}
