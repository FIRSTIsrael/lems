import { ObjectId } from 'mongodb';
import { Awards } from '../constants';
import { Team } from './team';

export interface Award {
  eventId: ObjectId;
  name: Awards;
  index: number;
  place: number;
  winner?: Team | string;
}
