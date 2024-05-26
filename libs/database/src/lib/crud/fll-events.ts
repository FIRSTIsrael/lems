import { Filter } from 'mongodb';
import { FllEvent } from '@lems/types';
import db from '../database';

export const getFllEvent = (filter: Filter<FllEvent>) => {
  return db.collection<FllEvent>('fll-events').findOne(filter);
};

export const getFllEvents = (filter: Filter<FllEvent>) => {
  return db.collection<FllEvent>('fll-events').find(filter).toArray();
};

export const getAllFllEvents = () => {
  return db.collection<FllEvent>('fll-events').find({}).toArray();
};

export const updateFllEvent = (
  filter: Filter<FllEvent>,
  newFllEvent: Partial<FllEvent>,
  upsert = false
) => {
  return db.collection<FllEvent>('fll-events').updateOne(filter, { $set: newFllEvent }, { upsert });
};

export const addFllEvent = (fllEvent: FllEvent) => {
  return db
    .collection<FllEvent>('fll-events')
    .insertOne(fllEvent)
    .then(response => response);
};

export const deleteFllEvent = (filter: Filter<FllEvent>) => {
  return db
    .collection<FllEvent>('fll-events')
    .deleteOne(filter)
    .then(response => response);
};
