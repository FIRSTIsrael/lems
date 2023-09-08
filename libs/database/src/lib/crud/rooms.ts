import db from '../database';
import { ObjectId } from 'mongodb';
import { JudgingRoom } from '@lems/types';

export const getEventRooms = (eventId: ObjectId) => {
  return db.collection<JudgingRoom>('rooms').find({ event: eventId }).toArray();
};
