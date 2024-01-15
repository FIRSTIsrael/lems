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
        average: { $avg: '$roomSessions.delay' },
        range: [{ $min: '$roomSessions.delay' }, { $max: '$roomSessions.delay' }]
      }
    }
  ];

  const report = await db.db.collection('sessions').aggregate(pipeline).toArray();
  report.sort((a, b) => a.room.localeCompare(b.room));
  res.json(report);
});

router.use('/scores', scoresRouter);

export default router;
