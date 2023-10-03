import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { Scoresheet } from '@lems/types';

export const getScoresheet = (filter: Filter<Scoresheet>) => {
  return db.collection<Scoresheet>('scoresheets').findOne(filter);
};

export const getTeamScoresheets = (teamId: ObjectId) => {
  return db.collection<Scoresheet>('scoresheets').find({ teamId: teamId }).toArray();
};

export const addScoresheet = (scoresheet: Scoresheet) => {
  return db
    .collection<Scoresheet>('scoresheets')
    .insertOne(scoresheet)
    .then(response => response);
};

export const addScoresheets = (scoresheets: Array<Scoresheet>) => {
  return db
    .collection<Scoresheet>('scoresheets')
    .insertMany(scoresheets)
    .then(response => response);
};

export const updateScoresheet = (
  filter: Filter<Scoresheet>,
  newScoresheet: Partial<Scoresheet>
) => {
  return db
    .collection<Scoresheet>('scoresheets')
    .updateOne(filter, { $set: newScoresheet }, { upsert: true });
};

export const deleteScoresheet = (filter: Filter<Scoresheet>) => {
  return db
    .collection<Scoresheet>('scoresheets')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteTeamScoresheets = (teamId: ObjectId) => {
  return db
    .collection<Scoresheet>('scoresheets')
    .deleteMany({ teamId: teamId })
    .then(response => response);
};
