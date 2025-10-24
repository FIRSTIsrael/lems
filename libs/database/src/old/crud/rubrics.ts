import { Filter, ObjectId } from 'mongodb';
import db from '../database';

export const getRubric = (filter: Filter<any>) => {
  return db.collection<any>('rubrics').findOne(filter);
};

export const getTeamRubrics = (teamId: ObjectId) => {
  return db.collection<any>('rubrics').find({ teamId }).toArray();
};

export const getDivisionRubrics = (divisionId: ObjectId) => {
  return db.collection<any>('rubrics').find({ divisionId }).toArray();
};

export const getDivisionRubricsFromCategory = (divisionId: ObjectId, category: any) => {
  return db.collection<any>('rubrics').find({ divisionId, category }).toArray();
};

export const addRubric = (rubric: any) => {
  return db.collection<any>('rubrics').insertOne(rubric);
};

export const addRubrics = (rubrics: Array<any>) => {
  return db.collection<any>('rubrics').insertMany(rubrics);
};

export const updateRubric = (filter: Filter<any>, newRubric: Partial<any>, upsert = false) => {
  return db.collection<any>('rubrics').updateOne(filter, { $set: newRubric }, { upsert });
};

export const deleteRubric = (filter: Filter<any>) => {
  return db.collection<any>('rubrics').deleteOne(filter);
};

export const deleteTeamRubrics = (teamId: ObjectId) => {
  return db.collection<any>('rubrics').deleteMany({ teamId });
};
