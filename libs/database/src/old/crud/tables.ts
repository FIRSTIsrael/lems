import { Filter, ObjectId } from 'mongodb';
import db from '../database';

export const getTable = (filter: Filter<any>) => {
  return db.collection<any>('tables').findOne(filter);
};

export const getDivisionTables = (divisionId: ObjectId) => {
  return db.collection<any>('tables').find({ divisionId }).toArray();
};

export const addTable = (table: any) => {
  return db.collection<any>('tables').insertOne(table);
};

export const addTables = (tables: Array<any>) => {
  return db.collection<any>('tables').insertMany(tables);
};

export const updateTable = (filter: Filter<any>, newTable: Partial<any>, upsert = false) => {
  return db.collection<any>('tables').updateOne(filter, { $set: newTable }, { upsert });
};

export const deleteTable = (filter: Filter<any>) => {
  return db.collection<any>('tables').deleteOne(filter);
};

export const deleteDivisionTables = (divisionId: ObjectId) => {
  return db.collection<any>('tables').deleteMany({ divisionId });
};
