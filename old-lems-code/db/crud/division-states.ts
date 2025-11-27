import { Filter, ObjectId } from 'mongodb';
import db from '../database';

export const getDivisionState = (filter: Filter<any>) => {
  return db.collection('division-states').findOne(filter);
};

export const getDivisionStateFromDivision = (divisionId: ObjectId) => {
  return db.collection('division-states').findOne({ divisionId });
};

export const addDivisionState = (state: any) => {
  return db.collection('division-states').insertOne(state);
};

export const updateDivisionState = (
  filter: Filter<any>,
  newDivisionState: Partial<any>,
  upsert = false
) => {
  return db.collection('division-states').updateOne(filter, { $set: newDivisionState }, { upsert });
};

export const deleteDivisionState = (filter: Filter<any>) => {
  return db.collection('division-states').deleteOne(filter);
};
