import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/all', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { eventId: new ObjectId(req.params.eventId), status: 'ready' }
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$data.score' },
        median: {
          $median: {
            input: '$data.score',
            method: 'approximate'
          }
        }
      }
    }
  ];

  const report = await db.db.collection('scoresheets').aggregate(pipeline).next();
  res.json(report);
});

router.get('/top', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { eventId: new ObjectId(req.params.eventId), status: 'ready', stage: 'ranking' }
    },
    {
      $group: {
        _id: '$teamId',
        maxScore: { $max: '$data.score' }
      }
    },
    {
      $project: {
        _id: false,
        teamId: '$_id',
        maxScore: true
      }
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$maxScore' },
        median: {
          $median: {
            input: '$maxScore',
            method: 'approximate'
          }
        }
      }
    }
  ];

  const report = await db.db.collection('scoresheets').aggregate(pipeline).next();
  res.json(report);
});

export default router;
