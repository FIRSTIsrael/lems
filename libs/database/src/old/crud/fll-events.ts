import { WithId, AggregationCursor, Filter } from 'mongodb';
import db from '../database';

export const getFllEvent = (filter: Filter<any>) => {
  return findFllEvents(filter).next();
};

export const findFllEvents = (filter: Filter<any>) => {
  return db.collection('fll-events').aggregate([
    { $match: filter },
    {
      $lookup: {
        from: 'divisions',
        localField: '_id',
        foreignField: 'eventId',
        as: 'divisions'
      }
    }
  ]) as AggregationCursor<WithId<any>>;
};

export const getFllEvents = (filter: Filter<any>) => {
  return findFllEvents(filter).toArray();
};

export const getAllFllEvents = () => {
  return findFllEvents({}).toArray();
};

export const updateFllEvent = (filter: Filter<any>, newFllEvent: Partial<any>, upsert = false) => {
  return db.collection('fll-events').updateOne(filter, { $set: newFllEvent }, { upsert });
};

export const addFllEvent = (fllEvent: any) => {
  return db.collection('fll-events').insertOne(fllEvent);
};

export const deleteFllEvent = (filter: Filter<any>) => {
  return db.collection('fll-events').deleteOne(filter);
};
