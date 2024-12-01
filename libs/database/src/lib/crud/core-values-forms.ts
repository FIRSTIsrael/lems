import { Filter, ObjectId } from 'mongodb';
import { CoreValuesForm } from '@lems/types';
import db from '../database';

export const getCoreValuesForm = (filter: Filter<CoreValuesForm>) => {
  return db.collection<CoreValuesForm>('core-values-forms').findOne(filter);
};

export const getDivisionCoreValuesForms = (divisionId: ObjectId) => {
  return db
    .collection<CoreValuesForm>('core-values-forms')
    .find({ divisionId: divisionId })
    .toArray();
};

export const addCoreValuesForm = (cvForm: CoreValuesForm) => {
  return db.collection<CoreValuesForm>('core-values-forms').insertOne(cvForm);
};

export const updateCoreValuesForm = (
  filter: Filter<CoreValuesForm>,
  newCoreValuesForm: Partial<CoreValuesForm>,
  upsert = false
) => {
  return db
    .collection<CoreValuesForm>('core-values-forms')
    .updateOne(filter, { $set: newCoreValuesForm }, { upsert });
};

export const deleteCoreValuesForm = (filter: Filter<CoreValuesForm>) => {
  return db.collection<CoreValuesForm>('core-values-forms').deleteOne(filter);
};
