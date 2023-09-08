import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { JudgingRoom } from '@lems/types';
import { ReplaceResult } from '../types/responses';

export const getRoom = (filter: Filter<JudgingRoom>) => {
  return db.collection<JudgingRoom>('rooms').findOne(filter);
};

export const getEventRooms = (eventId: ObjectId) => {
  return db.collection<JudgingRoom>('rooms').find({ event: eventId }).toArray();
};

export const addRoom = (room: JudgingRoom) => {
  return db
    .collection<JudgingRoom>('rooms')
    .insertOne(room)
    .then(response => response);
};

export const addRooms = (rooms: JudgingRoom[]) => {
  return db
    .collection<JudgingRoom>('rooms')
    .insertMany(rooms)
    .then(response => response);
};

export const updateRoom = (filter: Filter<JudgingRoom>, newTable: JudgingRoom) => {
  return db
    .collection<JudgingRoom>('rooms')
    .updateOne({ filter }, { $set: newTable }, { upsert: true });
};

export const deleteRoom = (filter: Filter<JudgingRoom>) => {
  return db
    .collection<JudgingRoom>('rooms')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteEventRooms = (eventId: ObjectId) => {
  return db
    .collection<JudgingRoom>('rooms')
    .deleteMany({ event: eventId })
    .then(response => response);
};

export const replaceEventRooms = async (eventId: ObjectId, newRooms: JudgingRoom[]) => {
  const response = {
    acknowledged: false,
    deletedCount: 0,
    insertedCount: 0,
    insertedIds: []
  } as ReplaceResult;

  const deleteResponse = await deleteEventRooms(eventId);
  if (deleteResponse.acknowledged) {
    response.deletedCount = deleteResponse.deletedCount;

    const insertResponse = await addRooms(newRooms);
    if (insertResponse.acknowledged) {
      response.acknowledged = true;
      response.insertedCount = insertResponse.insertedCount;
      response.insertedIds = insertResponse.insertedIds;
    }
  }

  return response;
};
