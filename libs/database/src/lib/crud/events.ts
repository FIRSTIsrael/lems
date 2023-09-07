import { Event } from '@lems/types';
import db from '../database';

export const getAllEvents = () => {
  return db.collection<Event>('events').find({}).toArray();
}