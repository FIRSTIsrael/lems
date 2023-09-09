import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { RobotGameTable } from '@lems/types';
import { ReplaceResult } from '../types/responses';

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

export const addTables = (tables: RobotGameTable[]) => {
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

export const replaceEventTables = async (eventId: ObjectId, newTables: RobotGameTable[]) => {
  const response = {
    acknowledged: false,
    deletedCount: 0,
    insertedCount: 0,
    insertedIds: []
  } as ReplaceResult;

  const deleteResponse = await deleteEventTables(eventId);
  if (deleteResponse.acknowledged) {
    response.deletedCount = deleteResponse.deletedCount;

    const insertResponse = await addTables(newTables);
    if (insertResponse.acknowledged) {
      response.acknowledged = true;
      response.insertedCount = insertResponse.insertedCount;
      response.insertedIds = insertResponse.insertedIds;
    }
  }

  return response;
};
