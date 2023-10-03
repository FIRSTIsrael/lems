import db from '../database';
import { Filter, ObjectId, WithId } from 'mongodb';
import { JudgingSession } from '@lems/types';
import { getEventRooms } from './rooms';

export const getSession = (filter: Filter<JudgingSession>) => {
  return db.collection<JudgingSession>('sessions').findOne(filter);
};

export const getEventSessions = (eventId: ObjectId) => {
  return getEventRooms(eventId).then(async rooms => {
    let sessions: Array<WithId<JudgingSession>> = [];
    await Promise.all(
      rooms.map(async room => {
        const roomSessions = await getRoomSessions(room._id);
        sessions = sessions.concat(roomSessions);
      })
    );
    return sessions;
  });
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

export const addSessions = (sessions: Array<JudgingSession>) => {
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
