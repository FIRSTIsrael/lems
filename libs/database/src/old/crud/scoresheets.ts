import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { Scoresheet } from '@lems/types';

export const getScoresheet = (filter: Filter<Scoresheet>) => {
  return db.collection<Scoresheet>('scoresheets').findOne(filter);
};

export const getTeamScoresheets = (teamId: ObjectId) => {
  return db.collection<Scoresheet>('scoresheets').find({ teamId }).toArray();
};

export const getDivisionScoresheets = (divisionId: ObjectId) => {
  return db.collection<Scoresheet>('scoresheets').find({ divisionId }).toArray();
};

export const addScoresheet = (scoresheet: Scoresheet) => {
  return db.collection<Scoresheet>('scoresheets').insertOne(scoresheet);
};

export const addScoresheets = (scoresheets: Array<Scoresheet>) => {
  return db.collection<Scoresheet>('scoresheets').insertMany(scoresheets);
};

export const updateScoresheet = (
  filter: Filter<Scoresheet>,
  newScoresheet: Partial<Scoresheet>,
  upsert = false
) => {
  return db
    .collection<Scoresheet>('scoresheets')
    .updateOne(filter, { $set: newScoresheet }, { upsert });
};

export const deleteScoresheet = (filter: Filter<Scoresheet>) => {
  return db.collection<Scoresheet>('scoresheets').deleteOne(filter);
};

export const deleteTeamScoresheets = (teamId: ObjectId) => {
  return db.collection<Scoresheet>('scoresheets').deleteMany({ teamId: teamId });
};
