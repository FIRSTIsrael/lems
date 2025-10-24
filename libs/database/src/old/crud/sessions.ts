import { Filter, ObjectId } from 'mongodb';
import db from '../database';

export const getSession = (filter: Filter<any>) => {
  return db.collection<any>('sessions').findOne(filter);
};

export const getDivisionSessions = (divisionId: ObjectId) => {
  return db.collection<any>('sessions').find({ divisionId }).toArray();
};

export const getRoomSessions = (roomId: ObjectId) => {
  return db.collection<any>('sessions').find({ roomId }).toArray();
};

export const addSession = (session: any) => {
  return db.collection<any>('sessions').insertOne(session);
};

export const addSessions = (sessions: Array<any>) => {
  return db.collection<any>('sessions').insertMany(sessions);
};

export const updateSession = (filter: Filter<any>, newSession: Partial<any>, upsert = false) => {
  return db.collection<any>('sessions').updateOne(filter, { $set: newSession }, { upsert });
};

export const deleteSession = (filter: Filter<any>) => {
  return db.collection<any>('sessions').deleteOne(filter);
};

export const deleteRoomSessions = (roomId: ObjectId) => {
  return db.collection<any>('sessions').deleteMany({ roomId });
};
