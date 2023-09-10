import { ObjectId } from 'mongodb';
import { RubricStatus, Status } from '../constants';

export interface JudgingSession {
  number: number;
  time: Date;
  team: ObjectId;
  room: ObjectId;
  status: Status;
  start?: Date;
  coreValues: RubricStatus;
  innovationProject: RubricStatus;
  robotDesign: RubricStatus;
}
