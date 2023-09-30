import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { RobotGameTable } from '@lems/types';

export const getTable = (filter: Filter<RobotGameTable>) => {
  return db.collection<RobotGameTable>('tables').findOne(filter);
};

export const getEventTables = (eventId: ObjectId) => {
  return db.collection<RobotGameTable>('tables').find({ event: eventId }).toArray();
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

export const updateTable = (filter: Filter<RobotGameTable>, newTable: Partial<RobotGameTable>) => {
  return db
    .collection<RobotGameTable>('tables')
    .updateOne(filter, { $set: newTable }, { upsert: true });
};

export const deleteTable = (filter: Filter<RobotGameTable>) => {
  return db
    .collection<RobotGameTable>('tables')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteEventTables = (eventId: ObjectId) => {
  return db
    .collection<RobotGameTable>('tables')
    .deleteMany({ event: eventId })
    .then(response => response);
};
