import { Filter, ObjectId } from 'mongodb';
import db from '../database';

export const getRoom = (filter: Filter<any>) => {
  return db.collection<any>('rooms').findOne(filter);
};

export const getDivisionRooms = (divisionId: ObjectId) => {
  return db.collection<any>('rooms').find({ divisionId }).toArray();
};

export const addRoom = (room: any) => {
  return db.collection<any>('rooms').insertOne(room);
};

export const addRooms = (rooms: Array<any>) => {
  return db.collection<any>('rooms').insertMany(rooms);
};

export const updateRoom = (filter: Filter<any>, newRoom: Partial<any>, upsert = false) => {
  return db.collection<any>('rooms').updateOne(filter, { $set: newRoom }, { upsert });
};

export const deleteRoom = (filter: Filter<any>) => {
  return db.collection<any>('rooms').deleteOne(filter);
};

export const deleteDivisionRooms = (divisionId: ObjectId) => {
  return db.collection<any>('rooms').deleteMany({ divisionId });
};
