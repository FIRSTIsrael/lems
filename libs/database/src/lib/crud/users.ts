import db from '../database';
import { ObjectId, Filter } from 'mongodb';
import { User } from '@lems/types';

export const getEventUsers = (eventId: ObjectId) => {
  return db.collection<User>('users').find({ event: eventId }).toArray();
};

export const getUser = (filter: Filter<User>) => {
  console.log(filter);
  return db.collection<User>('users').findOne(filter);
};
