import { Filter, ObjectId } from 'mongodb';
import db from '../database';

export const getJudgingDeliberation = (filter: Filter<any>) => {
  return db.collection('judging-deliberation').findOne(filter);
};

export const getJudgingDeliberationsFromDivision = (divisionId: ObjectId) => {
  return db.collection('judging-deliberation').find({ divisionId }).toArray();
};

export const addJudgingDeliberation = (deliberation: any) => {
  return db.collection('judging-deliberation').insertOne(deliberation);
};

export const addJudgingDeliberations = (deliberations: Array<any>) => {
  return db.collection('judging-deliberation').insertMany(deliberations);
};

export const updateJudgingDeliberation = (
  filter: Filter<any>,
  newJudgingDeliberation: Partial<any>,
  upsert = false
) => {
  return db
    .collection('judging-deliberation')
    .updateOne(filter, { $set: newJudgingDeliberation }, { upsert });
};

export const deleteJudgingDeliberation = (filter: Filter<any>) => {
  return db.collection('judging-deliberation').deleteOne(filter);
};

export const deleteDivisionDeliberations = (divisionId: ObjectId) => {
  return db.collection('judging-deliberation').deleteMany({ divisionId: divisionId });
};
