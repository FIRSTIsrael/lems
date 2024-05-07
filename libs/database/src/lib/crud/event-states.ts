import { Filter, ObjectId } from 'mongodb';
import { DivisionState } from '@lems/types';
import db from '../database';

export const getDivisionState = (filter: Filter<DivisionState>) => {
  return db.collection<DivisionState>('division-states').findOne(filter);
};

export const getDivisionStateFromDivision = (divisionId: ObjectId) => {
  return db.collection<DivisionState>('division-states').findOne({ divisionId });
};

export const addDivisionState = (state: DivisionState) => {
  return db
    .collection<DivisionState>('division-states')
    .insertOne(state)
    .then(response => response);
};

export const updateDivisionState = (
  filter: Filter<DivisionState>,
  newDivisionState: Partial<DivisionState>,
  upsert = false
) => {
  return db
    .collection<DivisionState>('division-states')
    .updateOne(filter, { $set: newDivisionState }, { upsert });
};

export const deleteDivisionState = (filter: Filter<DivisionState>) => {
  return db
    .collection<DivisionState>('division-states')
    .deleteOne(filter)
    .then(response => response);
};
