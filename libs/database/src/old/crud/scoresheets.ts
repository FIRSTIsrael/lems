import { Filter, ObjectId } from 'mongodb';
import db from '../database';

export const getScoresheet = (filter: Filter<any>) => {
  return db.collection<any>('scoresheets').findOne(filter);
};

export const getTeamScoresheets = (teamId: ObjectId) => {
  return db.collection<any>('scoresheets').find({ teamId }).toArray();
};

export const getDivisionScoresheets = (divisionId: ObjectId) => {
  return db.collection<any>('scoresheets').find({ divisionId }).toArray();
};

export const addScoresheet = (scoresheet: any) => {
  return db.collection<any>('scoresheets').insertOne(scoresheet);
};

export const addScoresheets = (scoresheets: Array<any>) => {
  return db.collection<any>('scoresheets').insertMany(scoresheets);
};

export const updateScoresheet = (
  filter: Filter<any>,
  newScoresheet: Partial<any>,
  upsert = false
) => {
  return db.collection<any>('scoresheets').updateOne(filter, { $set: newScoresheet }, { upsert });
};

export const deleteScoresheet = (filter: Filter<any>) => {
  return db.collection<any>('scoresheets').deleteOne(filter);
};

export const deleteTeamScoresheets = (teamId: ObjectId) => {
  return db.collection<any>('scoresheets').deleteMany({ teamId: teamId });
};
