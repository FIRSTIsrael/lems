import db from '../database';
import { Filter } from 'mongodb';
import { User } from '@lems/types';

export const getUser = async (filter: Filter<User>) => {
  return db.collection<User>('users').findOne(filter);
};
