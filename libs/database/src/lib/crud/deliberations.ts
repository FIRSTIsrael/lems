import { Filter, ObjectId } from 'mongodb';
import { JudgingDeliberation } from '@lems/types';
import db from '../database';

export const getJudgingDeliberation = (filter: Filter<JudgingDeliberation>) => {
  return db.collection<JudgingDeliberation>('judging-deliberation').findOne(filter);
};

export const getJudgingDeliberationsFromDivision = (divisionId: ObjectId) => {
  return db.collection<JudgingDeliberation>('judging-deliberation').find({ divisionId }).toArray();
};

export const addJudgingDeliberation = (deliberation: JudgingDeliberation) => {
  return db.collection<JudgingDeliberation>('judging-deliberation').insertOne(deliberation);
};

export const addJudgingDeliberations = (deliberations: Array<JudgingDeliberation>) => {
  return db.collection<JudgingDeliberation>('judging-deliberation').insertMany(deliberations);
};

export const updateJudgingDeliberation = (
  filter: Filter<JudgingDeliberation>,
  newJudgingDeliberation: Partial<JudgingDeliberation>,
  upsert = false
) => {
  return db
    .collection<JudgingDeliberation>('judging-deliberation')
    .updateOne(filter, { $set: newJudgingDeliberation }, { upsert });
};

export const deleteJudgingDeliberation = (filter: Filter<JudgingDeliberation>) => {
  return db.collection<JudgingDeliberation>('judging-deliberation').deleteOne(filter);
};

export const deleteDivisionDeliberations = (divisionId: ObjectId) => {
  return db
    .collection<JudgingDeliberation>('judging-deliberation')
    .deleteMany({ divisionId: divisionId });
};
