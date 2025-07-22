import { Filter, ObjectId } from 'mongodb';
import db from '../database';

export const getCoreValuesForm = (filter: Filter<any>) => {
  return db.collection('core-values-forms').findOne(filter);
};

export const getDivisionCoreValuesForms = (divisionId: ObjectId) => {
  return db.collection('core-values-forms').find({ divisionId: divisionId }).toArray();
};

export const addCoreValuesForm = (cvForm: any) => {
  return db.collection('core-values-forms').insertOne(cvForm);
};

export const updateCoreValuesForm = (
  filter: Filter<any>,
  newCoreValuesForm: Partial<any>,
  upsert = false
) => {
  return db
    .collection('core-values-forms')
    .updateOne(filter, { $set: newCoreValuesForm }, { upsert });
};

export const deleteCoreValuesForm = (filter: Filter<any>) => {
  return db.collection('core-values-forms').deleteOne(filter);
};
