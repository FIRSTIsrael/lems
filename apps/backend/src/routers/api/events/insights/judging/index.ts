import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import scoresRouter from './scores';

const router = express.Router({ mergeParams: true });

router.get('/delay', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: {
        eventId: new ObjectId(req.params.eventId),
        status: 'completed'
      }
    },
    {
      $project: {
        _id: true,
        roomId: true,
        number: true,
        scheduledTime: true,
        startTime: true,
        delay: {
          $dateDiff: {
            startDate: '$scheduledTime',
            endDate: '$startTime',
            unit: 'second'
          }
        }
      }
    },
    {
      $sort: { scheduledTime: 1 }
    },
    {
      $group: {
        _id: '$roomId',
        roomSessions: { $push: '$$ROOT' }
      }
    },
    {
      $lookup: {
        from: 'rooms',
        localField: '_id',
        foreignField: '_id',
        as: 'room'
      }
    },
    {
      $addFields: {
        room: { $arrayElemAt: ['$room', 0] }
      }
    },
    {
      $project: {
        _id: false,
        room: '$room.name',
        average: { $avg: '$roomSessions.delay' }
      }
    },
    {
      $facet: {
        bestRoom: [
          { $addFields: { absAverage: { $abs: '$average' } } },
          { $sort: { absAverage: 1 } },
          { $limit: 1 },
          { $unset: 'absAverage' }
        ],
        worstRoom: [{ $sort: { average: -1 } }, { $limit: 1 }],
        average: [
          {
            $group: {
              _id: null,
              average: { $avg: '$average' }
            }
          },
          { $project: { _id: false, average: true } }
        ]
      }
    },
    {
      $project: {
        best: { $arrayElemAt: ['$bestRoom', 0] },
        worst: { $arrayElemAt: ['$worstRoom', 0] },
        average: { $arrayElemAt: ['$average', 0] }
      }
    },
    {
      $addFields: {
        average: '$average.average'
      }
    }
  ];

  const report = await db.db.collection('sessions').aggregate(pipeline).next();
  res.json(report);
});

router.use('/scores', scoresRouter);

export default router;
