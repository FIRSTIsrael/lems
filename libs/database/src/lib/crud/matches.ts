import { Filter, ObjectId, WithId, AggregationCursor } from 'mongodb';
import { RobotGameMatch } from '@lems/types';
import db from '../database';

export const findMatches = (filter: Filter<RobotGameMatch>) => {
  return db.collection<RobotGameMatch>('matches').aggregate([
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
  ]) as AggregationCursor<WithId<RobotGameMatch>>;
};

export const getMatch = (filter: Filter<RobotGameMatch>) => {
  return findMatches(filter).next();
};

export const getEventMatches = (eventId: string) => {
  return findMatches({
    eventId: new ObjectId(eventId)
  }).toArray();
};

export const getTableMatches = (tableId: string) => {
  return findMatches({
    'participants.tableId': new ObjectId(tableId)
  }).toArray();
};

export const addMatch = (match: RobotGameMatch) => {
  return db.collection<RobotGameMatch>('matches').insertOne(match);
};

export const addMatches = (matches: Array<RobotGameMatch>) => {
  return db.collection<RobotGameMatch>('matches').insertMany(matches);
};

export const updateMatch = (
  filter: Filter<RobotGameMatch>,
  newMatch: Partial<RobotGameMatch>,
  upsert = false
) => {
  return db.collection<RobotGameMatch>('matches').updateOne(filter, { $set: newMatch }, { upsert });
};

export const updateMatches = (
  filter: Filter<RobotGameMatch>,
  newMatch: Partial<RobotGameMatch>
) => {
  return db.collection<RobotGameMatch>('matches').updateMany(filter, { $set: newMatch });
};

export const deleteMatch = (filter: Filter<RobotGameMatch>) => {
  return db
    .collection<RobotGameMatch>('matches')
    .deleteOne(filter)
    .then(response => response);
};

export const deleteEventMatches = (eventId: ObjectId) => {
  return db
    .collection<RobotGameMatch>('matches')
    .deleteMany({ eventId: eventId })
    .then(response => response);
};

export const deleteTableMatches = (tableId: ObjectId) => {
  return db
    .collection<RobotGameMatch>('matches')
    .deleteMany({ table: tableId })
    .then(response => response);
};
