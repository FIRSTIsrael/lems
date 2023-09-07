import { Filter } from 'mongodb';
import { Event } from '@lems/types';
import db from '../database';

export const getEvent = (filter: Filter<Event>) => {
  return db.collection<Event>('events').findOne(filter);
};

export const getAllEvents = () => {
  return db.collection<Event>('events').find({}).toArray();
};
