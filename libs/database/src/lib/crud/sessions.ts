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

export const updateSession = (
  filter: Filter<JudgingSession>,
  newSession: Partial<JudgingSession>
) => {
  return db
    .collection<JudgingSession>('sessions')
    .updateOne(filter, { $set: newSession }, { upsert: true });
};

export const deleteSession = (filter: Filter<JudgingSession>) => {
  return db
    .collection<JudgingSession>('sessions')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteRoomSessions = (roomId: ObjectId) => {
  return db
    .collection<JudgingSession>('sessions')
    .deleteMany({ room: roomId })
    .then(response => response);
};

export const replaceRoomSessions = async (roomId: ObjectId, newTables: JudgingSession[]) => {
  const response = {
    acknowledged: false,
    deletedCount: 0,
    insertedCount: 0,
    insertedIds: []
  } as ReplaceResult;

  const deleteResponse = await deleteRoomSessions(roomId);
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
