import { ObjectId } from 'mongodb';
import { Status } from '../constants';

export interface JudgingSession {
  divisionId: ObjectId;
  number: number;
  teamId: ObjectId | null;
  roomId: ObjectId;
  called: boolean;
  queued: boolean;
  status: Status;
  scheduledTime: Date;
  startTime?: Date;
}
