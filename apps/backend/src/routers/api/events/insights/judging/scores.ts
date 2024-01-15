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
      $project: {
        category: true,
        teamId: true,
        scores: { $objectToArray: '$data.values' }
      }
    },
    {
      $project: {
        averageScore: { $avg: '$scores.v.value' }
      }
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$averageScore' },
        median: {
          $median: {
            input: '$averageScore',
            method: 'approximate'
          }
        }
      }
    }
  ];

  const report = await db.db.collection('rubrics').aggregate(pipeline).next();
  res.json(report);
});

router.get('/categories', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { eventId: new ObjectId(req.params.eventId), status: 'ready' }
    },
    {
      $project: {
        category: true,
        teamId: true,
        scores: { $objectToArray: '$data.values' }
      }
    },
    {
      $project: {
        category: true,
        averageScore: { $avg: '$scores.v.value' }
      }
    },
    {
      $group: {
        _id: '$category',
        average: { $avg: '$averageScore' },
        median: {
          $median: {
            input: '$averageScore',
            method: 'approximate'
          }
        }
      }
    },
    { $addFields: { category: '$_id' } }
  ];

  const report = await db.db.collection('rubrics').aggregate(pipeline).toArray();
  res.json(report);
});

router.get('/record', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { eventId: new ObjectId(req.params.eventId), status: 'ready' }
    },
    {
      $project: {
        category: true,
        teamId: true,
        scores: { $objectToArray: '$data.values' }
      }
    },
    {
      $project: {
        averageScore: { $avg: '$scores.v.value' }
      }
    },
    {
      $group: {
        _id: null,
        result: { $max: '$averageScore' }
      }
    }
  ];

  const report = await db.db.collection('rubrics').aggregate(pipeline).next();
  res.json(report);
});

router.get('/optional-award-nominations', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: {
        eventId: new ObjectId(req.params.eventId),
        category: 'core-values',
        status: 'ready'
      }
    },
    {
      $project: {
        category: true,
        teamId: true,
        awards: { $objectToArray: '$data.awards' }
      }
    },
    {
      $group: {
        _id: '$_id',
        nominations: {
          $sum: {
            $size: {
              $filter: {
                input: '$awards.v',
                cond: '$$this'
              }
            }
          }
        }
      }
    },
    { $match: { nominations: { $gt: 0 } } },
    {
      $group: {
        _id: null,
        result: { $sum: 1 }
      }
    }
  ];

  const report = await db.db.collection('rubrics').aggregate(pipeline).next();
  res.json(report);
});

export default router;
