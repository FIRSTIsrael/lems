import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { Rubric, JudgingCategory } from '@lems/types';

export const getRubric = (filter: Filter<Rubric<JudgingCategory>>) => {
  return db.collection<Rubric<JudgingCategory>>('rubrics').findOne(filter);
};

export const getTeamRubrics = (teamId: ObjectId) => {
  return db.collection<Rubric<JudgingCategory>>('rubrics').find({ teamId }).toArray();
};

export const getEventRubrics = (divisionId: ObjectId) => {
  return db.collection<Rubric<JudgingCategory>>('rubrics').find({ divisionId }).toArray();
};

export const addRubric = (rubric: Rubric<JudgingCategory>) => {
  return db
    .collection<Rubric<JudgingCategory>>('rubrics')
    .insertOne(rubric)
    .then(response => response);
};

export const addRubrics = (rubrics: Array<Rubric<JudgingCategory>>) => {
  return db
    .collection<Rubric<JudgingCategory>>('rubrics')
    .insertMany(rubrics)
    .then(response => response);
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
  return db
    .collection<Rubric<JudgingCategory>>('rubrics')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteTeamRubrics = (teamId: ObjectId) => {
  return db
    .collection<Rubric<JudgingCategory>>('rubrics')
    .deleteMany({ teamId })
    .then(response => response);
};
