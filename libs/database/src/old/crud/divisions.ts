import { Filter, ObjectId } from 'mongodb';
import db from '../database';

export const getDivision = (filter: Filter<any>) => {
  return db.collection('divisions').findOne(filter);
};

export const getDivisions = (filter: Filter<any>) => {
  return db.collection('divisions').find(filter).toArray();
};

export const getDivisionWithEvent = (filter: Filter<any>) => {
  return db
    .collection('divisions')
    .aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'fll-events',
          localField: 'eventId',
          foreignField: '_id',
          as: 'event'
        }
      },
      { $unwind: '$event' }
    ])
    .next();
};

export const getEventDivisions = (eventId: ObjectId) => {
  return db.collection('divisions').find({ eventId }).toArray();
};

export const getAllDivisions = () => {
  return db.collection('divisions').find({}).toArray();
};

export const updateDivision = (filter: Filter<any>, newDivision: Partial<any>, upsert = false) => {
  return db.collection('divisions').updateOne(filter, { $set: newDivision }, { upsert });
};

export const addDivision = (division: any) => {
  return db.collection('divisions').insertOne(division);
};

export const deleteDivision = (filter: Filter<any>) => {
  return db.collection('divisions').deleteOne(filter);
};
