import { Filter, ObjectId } from 'mongodb';
import { CoreValuesForm } from '@lems/types';
import db from '../database';

export const getCoreValuesForm = (filter: Filter<CoreValuesForm>) => {
  return db.collection<CoreValuesForm>('core-values-forms').findOne(filter);
};

export const getEventCoreValuesForms = (eventId: ObjectId) => {
  return db.collection<CoreValuesForm>('core-values-forms').find({ eventId: eventId }).toArray();
};

export const addCoreValuesForm = (cvForm: CoreValuesForm) => {
  return db
    .collection<CoreValuesForm>('core-values-forms')
    .insertOne(cvForm)
    .then(response => response);
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
  return db
    .collection<CoreValuesForm>('core-values-forms')
    .deleteOne(filter)
    .then(response => response);
};
