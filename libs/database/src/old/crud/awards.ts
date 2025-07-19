import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { Award } from '@lems/types';

export const getAward = (filter: Filter<Award>) => {
  return db.collection<Award>('awards').findOne(filter);
};

export const getDivisionAwards = (divisionId: ObjectId) => {
  return db.collection<Award>('awards').find({ divisionId }).toArray();
};

export const getTeamAwards = (teamId: ObjectId) => {
  return db.collection<Award>('awards').find({ 'winner._id': teamId }).toArray();
};

export const addAward = (award: Award) => {
  return db.collection<Award>('awards').insertOne(award);
};

export const addAwards = (awards: Array<Award>) => {
  return db.collection<Award>('awards').insertMany(awards);
};

export const updateAward = (filter: Filter<Award>, newAward: Partial<Award>, upsert = false) => {
  return db.collection<Award>('awards').updateOne(filter, { $set: newAward }, { upsert });
};

export const deleteAward = (filter: Filter<Award>) => {
  return db.collection<Award>('awards').deleteOne(filter);
};

export const deleteAwards = (filter: Filter<Award>) => {
  return db.collection<Award>('awards').deleteMany(filter);
};

export const deleteDivisionAwards = (divisionId: ObjectId) => {
  return db.collection<Award>('awards').deleteMany({ divisionId });
};
