import { Filter, ObjectId } from 'mongodb';
import { RobotGameMatch } from '@lems/types';
import db from '../database';
import { ReplaceResult } from '../types/responses';

export const getMatch = (filter: Filter<RobotGameMatch>) => {
  return db.collection<RobotGameMatch>('matches').findOne(filter);
};

export const getTableMatches = (tableId: ObjectId) => {
  return db.collection<RobotGameMatch>('matches').find({ table: tableId }).toArray();
};

export const addMatch = (match: RobotGameMatch) => {
  return db
    .collection<RobotGameMatch>('matches')
    .insertOne(match)
    .then(response => response);
};

export const addMatches = (matches: RobotGameMatch[]) => {
  return db
    .collection<RobotGameMatch>('matches')
    .insertMany(matches)
    .then(response => response);
};

export const updateMatch = (filter: Filter<RobotGameMatch>, newMatch: RobotGameMatch) => {
  return db
    .collection<RobotGameMatch>('matches')
    .updateOne(filter, { $set: newMatch }, { upsert: true });
};

export const deleteMatch = (filter: Filter<RobotGameMatch>) => {
  return db
    .collection<RobotGameMatch>('matches')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteTableMatches = (tableId: ObjectId) => {
  return db
    .collection<RobotGameMatch>('matches')
    .deleteMany({ table: tableId })
    .then(response => response);
};

export const replaceTableMatches = async (tableId: ObjectId, newMatches: RobotGameMatch[]) => {
  const response = {
    acknowledged: false,
    deletedCount: 0,
    insertedCount: 0,
    insertedIds: []
  } as ReplaceResult;

  const deleteResponse = await deleteTableMatches(tableId);
  if (deleteResponse.acknowledged) {
    response.deletedCount = deleteResponse.deletedCount;

    const insertResponse = await addMatches(newMatches);
    if (insertResponse.acknowledged) {
      response.acknowledged = true;
      response.insertedCount = insertResponse.insertedCount;
      response.insertedIds = insertResponse.insertedIds;
    }
  }

  return response;
};
