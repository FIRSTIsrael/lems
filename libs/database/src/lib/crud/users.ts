import { ObjectId, Filter, WithId } from 'mongodb';
import { User, SafeUser } from '@lems/types';
import db from '../database';

export const getEventUsersWithCredentials = (divisionId: ObjectId) => {
  return db.collection<User>('users').find({ divisionId }).toArray();
};

export const getEventUsers = (divisionId: ObjectId): Promise<Array<WithId<SafeUser>>> => {
  return getEventUsersWithCredentials(divisionId).then(users => {
    return users.map(user => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, lastPasswordSetDate, ...safeUser } = user;
      return safeUser as WithId<SafeUser>;
    });
  });
};

export const getUserWithCredentials = (filter: Filter<User>) => {
  return db.collection<User>('users').findOne(filter);
};

export const getUser = (filter: Filter<User>): Promise<WithId<SafeUser> | null> => {
  return getUserWithCredentials(filter).then(user => {
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, lastPasswordSetDate, ...safeUser } = user;
    return safeUser as WithId<SafeUser>;
  });
};

export const addUser = (user: User) => {
  return db
    .collection<User>('users')
    .insertOne(user)
    .then(response => response);
};

export const addUsers = (users: Array<User>) => {
  return db
    .collection<User>('users')
    .insertMany(users)
    .then(response => response);
};

export const updateUser = (filter: Filter<User>, newUser: Partial<User>, upsert = false) => {
  return db.collection<User>('users').updateOne(filter, { $set: newUser }, { upsert });
};

export const deleteUser = (filter: Filter<User>) => {
  return db
    .collection<User>('users')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteEventUsers = (divisionId: ObjectId) => {
  return db
    .collection<User>('users')
    .deleteMany({ divisionId })
    .then(response => response);
};
