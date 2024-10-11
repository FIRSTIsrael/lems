import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get(
  '/average-median',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: {
          divisionId: new ObjectId(req.params.divisionId),
          status: {
            $in: ['ready', 'waiting-for-review', 'completed']
          }
        }
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
  })
);

router.get(
  '/categories',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: {
          divisionId: new ObjectId(req.params.divisionId),
          status: {
            $in: ['ready', 'waiting-for-review', 'completed']
          }
        }
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
  })
);

router.get(
  '/highest-average-score',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: {
          divisionId: new ObjectId(req.params.divisionId),
          status: {
            $in: ['ready', 'waiting-for-review', 'completed']
          }
        }
      },
      {
        $project: {
          category: true,
          teamId: true,
          scores: { $objectToArray: '$data.values' }
        }
      },
      {
        $addFields: {
          averageScore: { $avg: '$scores.v.value' }
        }
      },
      {
        $group: {
          _id: '$teamId',
          averageScore: { $avg: '$averageScore' }
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
  })
);

router.get(
  '/rooms',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: {
          divisionId: new ObjectId(req.params.divisionId),
          status: {
            $in: ['ready', 'waiting-for-review', 'completed']
          }
        }
      },
      {
        $addFields: {
          scores: { $objectToArray: '$data.values' }
        }
      },
      {
        $project: {
          teamId: true,
          category: true,
          averageScore: { $avg: '$scores.v.value' }
        }
      },
      {
        $lookup: {
          from: 'sessions',
          let: { teamId: '$teamId' },
          pipeline: [{ $match: { $expr: { $eq: ['$teamId', '$$teamId'] } } }],
          as: 'session'
        }
      },
      {
        $addFields: {
          session: { $arrayElemAt: ['$session', 0] }
        }
      },
      {
        $project: {
          _id: false,
          teamId: true,
          category: true,
          averageScore: true,
          roomId: '$session.roomId'
        }
      },
      {
        $group: {
          _id: {
            _id: '$roomId',
            category: '$category'
          },
          averageScore: { $avg: '$averageScore' }
        }
      },
      {
        $group: {
          _id: '$_id._id',
          scores: {
            $push: {
              k: '$_id.category',
              v: '$averageScore'
            }
          }
        }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [{ _id: '$_id' }, { $arrayToObject: '$scores' }]
          }
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
          room: { $arrayElemAt: ['$room.name', 0] },
          roomId: { $arrayElemAt: ['$room._id', 0] }
        }
      },
      {
        $project: {
          _id: false,
          'innovation-project': true,
          'core-values': true,
          'robot-design': true,
          average: { $avg: ['$innovation-project', '$core-values', '$robot-design'] },
          room: true,
          roomId: true
        }
      }
    ];

    const report = await db.db.collection('rubrics').aggregate(pipeline).toArray();
    report.sort((a, b) => a.room.localeCompare(b.room));
    res.json(report);
  })
);

export default router;
