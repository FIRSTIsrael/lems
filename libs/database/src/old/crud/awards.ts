import { Filter, ObjectId } from 'mongodb';
import db from '../database';

export const getAward = (filter: any) => {
  return db.collection('awards').findOne(filter);
};

export const getDivisionAwards = (divisionId: ObjectId) => {
  return db.collection('awards').find({ divisionId }).toArray();
};

export const getTeamAwards = (teamId: ObjectId) => {
  return db.collection('awards').find({ 'winner._id': teamId }).toArray();
};

export const addAward = (award: any) => {
  return db.collection('awards').insertOne(award);
};

export const addAwards = (awards: Array<any>) => {
  return db.collection('awards').insertMany(awards);
};

export const updateAward = (filter: Filter<any>, newAward: Partial<any>, upsert = false) => {
  return db.collection('awards').updateOne(filter, { $set: newAward }, { upsert });
};

export const deleteAward = (filter: Filter<any>) => {
  return db.collection('awards').deleteOne(filter);
};

export const deleteAwards = (filter: Filter<any>) => {
  return db.collection('awards').deleteMany(filter);
};

export const deleteDivisionAwards = (divisionId: ObjectId) => {
  return db.collection('awards').deleteMany({ divisionId });
};
