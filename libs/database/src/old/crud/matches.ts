import { UpdateFilter, Filter, ObjectId, WithId, AggregationCursor } from 'mongodb';
import db from '../database';
import { RobotGameMatch } from '../../schema';

export const findMatches = (filter: Filter<any>) => {
  return db.collection<any>('matches').aggregate([
    { $match: filter },
    ...(filter.stage !== 'test'
      ? [
          {
            $unwind: {
              path: '$participants',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $lookup: {
              from: 'teams',
              localField: 'participants.teamId',
              foreignField: '_id',
              as: 'participants.team'
            }
          },
          {
            $addFields: {
              'participants.team': { $arrayElemAt: ['$participants.team', 0] }
            }
          },
          {
            $group: {
              _id: '$_id',
              participants: { $push: '$participants' },
              data: { $first: '$$ROOT' }
            }
          },
          {
            $replaceRoot: {
              newRoot: { $mergeObjects: ['$data', { participants: '$participants' }] }
            }
          }
        ]
      : []),
    { $sort: { number: 1 } }
  ]) as AggregationCursor<WithId<any>>;
};

export const getMatch = (filter: Filter<any>) => {
  return findMatches(filter).next();
};

export const getDivisionMatches = (divisionId: string | ObjectId) => {
  return findMatches({
    divisionId: new ObjectId(divisionId)
  }).toArray();
};

export const getTableMatches = (tableId: string) => {
  return findMatches({
    'participants.tableId': new ObjectId(tableId)
  }).toArray();
};

export const addMatch = (match: any) => {
  return db.collection<any>('matches').insertOne(match);
};

export const addMatches = (matches: Array<any>) => {
  return db.collection<any>('matches').insertMany(matches);
};

export const updateMatch = (
  filter: Filter<any>,
  newMatch: Partial<any> | UpdateFilter<any>,
  upsert = false
) => {
  return db.collection<any>('matches').updateOne(filter, { $set: newMatch }, { upsert });
};

export const updateMatches = (filter: Filter<any>, newMatch: Partial<any>) => {
  return db.collection<any>('matches').updateMany(filter, { $set: newMatch });
};

export const deleteMatch = (filter: Filter<any>) => {
  return db.collection<any>('matches').deleteOne(filter);
};

export const deleteDivisionMatches = (divisionId: ObjectId) => {
  return db.collection<any>('matches').deleteMany({ divisionId: divisionId });
};

export const deleteTableMatches = (tableId: ObjectId) => {
  return db.collection<any>('matches').deleteMany({ table: tableId });
};
