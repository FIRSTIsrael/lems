import db from '../database';
import { Filter, ObjectId } from 'mongodb';
import { JudgingRoom } from '@lems/types';

export const getRoom = (filter: Filter<JudgingRoom>) => {
  return db.collection<JudgingRoom>('rooms').findOne(filter);
};

export const getDivisionRooms = (divisionId: ObjectId) => {
  return db.collection<JudgingRoom>('rooms').find({ divisionId }).toArray();
};

export const addRoom = (room: JudgingRoom) => {
  return db
    .collection<JudgingRoom>('rooms')
    .insertOne(room)
    .then(response => response);
};

export const addRooms = (rooms: Array<JudgingRoom>) => {
  return db
    .collection<JudgingRoom>('rooms')
    .insertMany(rooms)
    .then(response => response);
};

export const updateRoom = (
  filter: Filter<JudgingRoom>,
  newRoom: Partial<JudgingRoom>,
  upsert = false
) => {
  return db.collection<JudgingRoom>('rooms').updateOne(filter, { $set: newRoom }, { upsert });
};

export const deleteRoom = (filter: Filter<JudgingRoom>) => {
  return db
    .collection<JudgingRoom>('rooms')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteDivisionRooms = (divisionId: ObjectId) => {
  return db
    .collection<JudgingRoom>('rooms')
    .deleteMany({ divisionId })
    .then(response => response);
};
