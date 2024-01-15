import { ObjectId } from 'mongodb';
import { RubricStatus, Status } from '../constants';

export interface JudgingSession {
  eventId: ObjectId;
  number: number;
  teamId: ObjectId | null;
  roomId: ObjectId;
  status: Status;
  scheduledTime: Date;
  startTime?: Date;
  coreValues: RubricStatus;
  innovationProject: RubricStatus;
  robotDesign: RubricStatus;
}
