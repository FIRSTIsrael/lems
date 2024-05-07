import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { RobotGameTable } from '@lems/types';

export const getTable = (filter: Filter<RobotGameTable>) => {
  return db.collection<RobotGameTable>('tables').findOne(filter);
};

export const getDivisionTables = (divisionId: ObjectId) => {
  return db.collection<RobotGameTable>('tables').find({ divisionId }).toArray();
};

export const addTable = (table: RobotGameTable) => {
  return db
    .collection<RobotGameTable>('tables')
    .insertOne(table)
    .then(response => response);
};

export const addTables = (tables: Array<RobotGameTable>) => {
  return db
    .collection<RobotGameTable>('tables')
    .insertMany(tables)
    .then(response => response);
};

export const updateTable = (
  filter: Filter<RobotGameTable>,
  newTable: Partial<RobotGameTable>,
  upsert = false
) => {
  return db.collection<RobotGameTable>('tables').updateOne(filter, { $set: newTable }, { upsert });
};

export const deleteTable = (filter: Filter<RobotGameTable>) => {
  return db
    .collection<RobotGameTable>('tables')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteDivisionTables = (divisionId: ObjectId) => {
  return db
    .collection<RobotGameTable>('tables')
    .deleteMany({ divisionId })
    .then(response => response);
};
