import { ObjectId, Filter } from 'mongodb';
import { User } from '@lems/types';
import db from '../database';

export const getEventUsers = (eventId: ObjectId) => {
  return db.collection<User>('users').find({ event: eventId }).toArray();
};

export const getUser = (filter: Filter<User>) => {
  return db.collection<User>('users').findOne(filter);
};

export const addUser = (user: User) => {
  return db
    .collection<User>('users')
    .insertOne(user)
    .then(response => response);
};

export const addUsers = (users: User[]) => {
  return db
    .collection<User>('users')
    .insertMany(users)
    .then(response => response);
};

export const updateUser = (filter: Filter<User>, newUser: Partial<User>) => {
  return db.collection<User>('users').updateOne(filter, { $set: newUser }, { upsert: true });
};

export const deleteUser = (filter: Filter<User>) => {
  return db
    .collection<User>('users')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteEventUsers = (eventId: ObjectId) => {
  return db
    .collection<User>('users')
    .deleteMany({ event: eventId })
    .then(response => response);
};
