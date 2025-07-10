import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { Rubric, JudgingCategory } from '@lems/types';

export const getRubric = (filter: Filter<Rubric<JudgingCategory>>) => {
  return db.collection<Rubric<JudgingCategory>>('rubrics').findOne(filter);
};

export const getTeamRubrics = (teamId: ObjectId) => {
  return db.collection<Rubric<JudgingCategory>>('rubrics').find({ teamId }).toArray();
};

export const getDivisionRubrics = (divisionId: ObjectId) => {
  return db.collection<Rubric<JudgingCategory>>('rubrics').find({ divisionId }).toArray();
};

export const getDivisionRubricsFromCategory = (divisionId: ObjectId, category: JudgingCategory) => {
  return db.collection<Rubric<JudgingCategory>>('rubrics').find({ divisionId, category }).toArray();
};

export const addRubric = (rubric: Rubric<JudgingCategory>) => {
  return db.collection<Rubric<JudgingCategory>>('rubrics').insertOne(rubric);
};

export const addRubrics = (rubrics: Array<Rubric<JudgingCategory>>) => {
  return db.collection<Rubric<JudgingCategory>>('rubrics').insertMany(rubrics);
};

export const updateRubric = (
  filter: Filter<Rubric<JudgingCategory>>,
  newRubric: Partial<Rubric<JudgingCategory>>,
  upsert = false
) => {
  return db
    .collection<Rubric<JudgingCategory>>('rubrics')
    .updateOne(filter, { $set: newRubric }, { upsert });
};

export const deleteRubric = (filter: Filter<Rubric<JudgingCategory>>) => {
  return db.collection<Rubric<JudgingCategory>>('rubrics').deleteOne(filter);
};

export const deleteTeamRubrics = (teamId: ObjectId) => {
  return db.collection<Rubric<JudgingCategory>>('rubrics').deleteMany({ teamId });
};
