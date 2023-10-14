import { ObjectId } from 'mongodb';
import { Awards } from '../constants';

export interface Award {
  eventId: ObjectId;
  name: Awards;
  place: number;
  teamId?: ObjectId;
}
