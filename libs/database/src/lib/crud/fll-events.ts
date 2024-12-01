import { WithId, AggregationCursor, Filter } from 'mongodb';
import { FllEvent } from '@lems/types';
import db from '../database';

export const getFllEvent = (filter: Filter<FllEvent>) => {
  return findFllEvents(filter).next();
};

export const findFllEvents = (filter: Filter<FllEvent>) => {
  return db.collection<FllEvent>('fll-events').aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'divisions',
        localField: '_id',
        foreignField: 'eventId',
        as: 'divisions'
      }
    }
  ]) as AggregationCursor<WithId<FllEvent>>;
};

export const getFllEvents = (filter: Filter<FllEvent>) => {
  return findFllEvents(filter).toArray();
};

export const getAllFllEvents = () => {
  return findFllEvents({}).toArray();
};

export const updateFllEvent = (
  filter: Filter<FllEvent>,
  newFllEvent: Partial<FllEvent>,
  upsert = false
) => {
  return db.collection<FllEvent>('fll-events').updateOne(filter, { $set: newFllEvent }, { upsert });
};

export const addFllEvent = (fllEvent: FllEvent) => {
  return db.collection<FllEvent>('fll-events').insertOne(fllEvent);
};

export const deleteFllEvent = (filter: Filter<FllEvent>) => {
  return db.collection<FllEvent>('fll-events').deleteOne(filter);
};
