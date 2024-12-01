import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { JudgingSession } from '@lems/types';

export const getSession = (filter: Filter<JudgingSession>) => {
  return db.collection<JudgingSession>('sessions').findOne(filter);
};

export const getDivisionSessions = (divisionId: ObjectId) => {
  return db.collection<JudgingSession>('sessions').find({ divisionId }).toArray();
};

export const getRoomSessions = (roomId: ObjectId) => {
  return db.collection<JudgingSession>('sessions').find({ roomId }).toArray();
};

export const addSession = (session: JudgingSession) => {
  return db.collection<JudgingSession>('sessions').insertOne(session);
};

export const addSessions = (sessions: Array<JudgingSession>) => {
  return db.collection<JudgingSession>('sessions').insertMany(sessions);
};

export const updateSession = (
  filter: Filter<JudgingSession>,
  newSession: Partial<JudgingSession>,
  upsert = false
) => {
  return db
    .collection<JudgingSession>('sessions')
    .updateOne(filter, { $set: newSession }, { upsert });
};

export const deleteSession = (filter: Filter<JudgingSession>) => {
  return db.collection<JudgingSession>('sessions').deleteOne(filter);
};

export const deleteRoomSessions = (roomId: ObjectId) => {
  return db.collection<JudgingSession>('sessions').deleteMany({ roomId });
};
