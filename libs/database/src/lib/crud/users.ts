import db from '../database';
import { ObjectId, Filter } from 'mongodb';
import { User } from '@lems/types';

export const getUser = (filter: Filter<User>) => {
  return db.collection<User>('users').findOne(filter);
};

export const getEventUsers = (eventId: ObjectId) => {
  return db.collection<User>('users').find({ event: eventId }).toArray();
};
