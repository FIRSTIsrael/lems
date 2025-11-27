import { ObjectId, Filter, WithId } from 'mongodb';
import db from '../database';

export const getDivisionUsersWithCredentials = (divisionId: ObjectId) => {
  return db.collection('users').find({ divisionId }).toArray();
};

export const getDivisionUsers = (divisionId: ObjectId): Promise<Array<any>> => {
  return getDivisionUsersWithCredentials(divisionId).then(users => {
    return users.map(user => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, lastPasswordSetDate, ...safeUser } = user;
      return safeUser as WithId<any>;
    });
  });
};

export const getEventUsers = (eventId: ObjectId): Promise<Array<WithId<any>>> => {
  return db
    .collection<any>('users')
    .find({ eventId })
    .toArray()
    .then(users => {
      return users.map(user => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, lastPasswordSetDate, ...safeUser } = user;
        return safeUser as WithId<any>;
      });
    });
};

export const getUserWithCredentials = (filter: Filter<any>) => {
  return db.collection<any>('users').findOne(filter);
};

export const getUsersWithCredentials = (filter: Filter<any>) => {
  return db.collection<any>('users').find(filter).toArray();
};

export const getUser = (filter: Filter<any>): Promise<WithId<any> | null> => {
  return getUserWithCredentials(filter).then(user => {
    if (!user) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, lastPasswordSetDate, ...safeUser } = user;
    return safeUser as WithId<any>;
  });
};

export const addUser = (user: any) => {
  return db.collection<any>('users').insertOne(user);
};

export const addUsers = (users: Array<any>) => {
  return db.collection<any>('users').insertMany(users);
};

export const updateUser = (filter: Filter<any>, newUser: Partial<any>, upsert = false) => {
  return db.collection<any>('users').updateOne(filter, { $set: newUser }, { upsert });
};

export const deleteUser = (filter: Filter<any>) => {
  return db.collection<any>('users').deleteOne(filter);
};

export const deleteDivisionUsers = (divisionId: ObjectId) => {
  return db.collection<any>('users').deleteMany({ divisionId });
};
