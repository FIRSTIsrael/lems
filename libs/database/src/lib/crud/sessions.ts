import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { JudgingSession } from '@lems/types';
import { ReplaceResult } from '../types/responses';

export const getSession = (filter: Filter<JudgingSession>) => {
  return db.collection<JudgingSession>('sessions').findOne(filter);
};

export const getRoomSessions = (roomId: ObjectId) => {
  return db.collection<JudgingSession>('sessions').find({ room: roomId }).toArray();
};

export const addSession = (session: JudgingSession) => {
  return db
    .collection<JudgingSession>('sessions')
    .insertOne(session)
    .then(response => response);
};

export const addSessions = (sessions: JudgingSession[]) => {
  return db
    .collection<JudgingSession>('sessions')
    .insertMany(sessions)
    .then(response => response);
};

export const updateSession = (filter: Filter<JudgingSession>, newTable: JudgingSession) => {
  return db
    .collection<JudgingSession>('sessions')
    .updateOne({ filter }, { $set: newTable }, { upsert: true });
};

export const deleteSession = (filter: Filter<JudgingSession>) => {
  return db
    .collection<JudgingSession>('sessions')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteEventSessions = (eventId: ObjectId) => {
  return db
    .collection<JudgingSession>('sessions')
    .deleteMany({ event: eventId })
    .then(response => response);
};

export const replaceEventSessions = async (eventId: ObjectId, newTables: JudgingSession[]) => {
  const response = {
    acknowledged: false,
    deletedCount: 0,
    insertedCount: 0,
    insertedIds: []
  } as ReplaceResult;

  const deleteResponse = await deleteEventSessions(eventId);
  if (deleteResponse.acknowledged) {
    response.deletedCount = deleteResponse.deletedCount;

    const insertResponse = await addSessions(newTables);
    if (insertResponse.acknowledged) {
      response.acknowledged = true;
      response.insertedCount = insertResponse.insertedCount;
      response.insertedIds = insertResponse.insertedIds;
    }
  }

  return response;
};
