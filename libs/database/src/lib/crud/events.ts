import { Filter } from 'mongodb';
import { Event } from '@lems/types';
import db from '../database';

export const getEvent = (filter: Filter<Event>) => {
  return db.collection<Event>('events').findOne(filter);
};

export const getEvents = (filter: Filter<Event>) => {
  return db.collection<Event>('events').find(filter).toArray();
};

export const getAllEvents = () => {
  return db.collection<Event>('events').find({}).toArray();
};

export const updateEvent = (filter: Filter<Event>, newEvent: Partial<Event>, upsert = false) => {
  return db.collection<Event>('events').updateOne(filter, { $set: newEvent }, { upsert });
};

export const addEvent = (event: Event) => {
  return db
    .collection<Event>('events')
    .insertOne(event)
    .then(response => response);
};

export const deleteEvent = (filter: Filter<Event>) => {
  return db
    .collection<Event>('events')
    .deleteOne(filter)
    .then(response => response);
};
