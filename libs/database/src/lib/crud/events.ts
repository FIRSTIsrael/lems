import { Filter } from 'mongodb';
import { Event } from '@lems/types';
import db from '../database';

export const getEvent = (filter: Filter<Event>) => {
  return db.collection<Event>('divisions').findOne(filter);
};

export const getEvents = (filter: Filter<Event>) => {
  return db.collection<Event>('divisions').find(filter).toArray();
};

export const getAllEvents = () => {
  return db.collection<Event>('divisions').find({}).toArray();
};

export const updateEvent = (filter: Filter<Event>, newEvent: Partial<Event>, upsert = false) => {
  return db.collection<Event>('divisions').updateOne(filter, { $set: newEvent }, { upsert });
};

export const addEvent = (division: Event) => {
  return db
    .collection<Event>('divisions')
    .insertOne(division)
    .then(response => response);
};

export const deleteEvent = (filter: Filter<Event>) => {
  return db
    .collection<Event>('divisions')
    .deleteOne(filter)
    .then(response => response);
};
