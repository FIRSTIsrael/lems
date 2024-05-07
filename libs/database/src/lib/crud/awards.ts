import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { Award } from '@lems/types';

export const getAward = (filter: Filter<Award>) => {
  return db.collection<Award>('awards').findOne(filter);
};

export const getEventAwards = (divisionId: ObjectId) => {
  return db.collection<Award>('awards').find({ divisionId }).toArray();
};

export const addAward = (award: Award) => {
  return db
    .collection<Award>('awards')
    .insertOne(award)
    .then(response => response);
};

export const addAwards = (awards: Array<Award>) => {
  return db
    .collection<Award>('awards')
    .insertMany(awards)
    .then(response => response);
};

export const updateAward = (filter: Filter<Award>, newAward: Partial<Award>, upsert = false) => {
  return db.collection<Award>('awards').updateOne(filter, { $set: newAward }, { upsert });
};

export const deleteAwards = (filter: Filter<Award>) => {
  return db
    .collection<Award>('awards')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteEventAwards = (divisionId: ObjectId) => {
  return db
    .collection<Award>('awards')
    .deleteMany({ divisionId })
    .then(response => response);
};
