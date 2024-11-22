import { Filter, ObjectId } from 'mongodb';
import { Division } from '@lems/types';
import db from '../database';

export const getDivision = (filter: Filter<Division>) => {
  return db.collection<Division>('divisions').findOne(filter);
};

export const getDivisions = (filter: Filter<Division>) => {
  return db.collection<Division>('divisions').find(filter).toArray();
};

export const getEventDivisions = (eventId: ObjectId) => {
  return db.collection<Division>('divisions').find({ eventId }).toArray();
};

export const getAllDivisions = () => {
  return db.collection<Division>('divisions').find({}).toArray();
};

export const updateDivision = (
  filter: Filter<Division>,
  newDivision: Partial<Division>,
  upsert = false
) => {
  return db.collection<Division>('divisions').updateOne(filter, { $set: newDivision }, { upsert });
};

export const addDivision = (division: Division) => {
  return db.collection<Division>('divisions').insertOne(division);
};

export const deleteDivision = (filter: Filter<Division>) => {
  return db.collection<Division>('divisions').deleteOne(filter);
};
