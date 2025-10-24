import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import scoresRouter from './scores';

const router = express.Router({ mergeParams: true });

router.get('/delay', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: {
        divisionId: new ObjectId(req.params.divisionId),
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

router.get('/optional-award-nominations', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: {
        divisionId: new ObjectId(req.params.divisionId),
        category: 'core-values',
        status: {
          $in: ['ready', 'waiting-for-review', 'completed']
        }
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

router.get('/robot-room-correlation-to-robot-game', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: {
        divisionId: new ObjectId(req.params.divisionId)
      }
    },
    {
      $lookup: {
        from: 'rubrics',
        let: { teamId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$teamId', '$$teamId'] },
                  { $in: ['$status', ['ready', 'waiting-for-review', 'completed']] },
                  { $eq: ['$category', 'robot-design'] }
                ]
              }
            }
          },
          {
            $project: {
              scores: { $objectToArray: '$data.values' }
            }
          },
          {
            $project: {
              _id: false,
              averageRobotDesignScore: { $avg: '$scores.v.value' }
            }
          }
        ],
        as: 'rubric'
      }
    },
    {
      $lookup: {
        from: 'scoresheets',
        let: { teamId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$teamId', '$$teamId'] },
                  { $eq: ['$stage', 'ranking'] },
                  { $eq: ['$status', 'ready'] }
                ]
              }
            }
          }
        ],
        as: 'scoresheets'
      }
    },
    {
      $match: {
        $expr: {
          $and: [{ $eq: [{ $size: '$rubric' }, 1] }, { $gt: [{ $size: '$scoresheets' }, 0] }]
        }
      }
    },
    {
      $project: {
        _id: false,
        teamId: '$_id',
        teamNumber: '$number',
        averageRobotDesignScore: { $arrayElemAt: ['$rubric.averageRobotDesignScore', 0] },
        topRobotGameScore: { $max: '$scoresheets.data.score' }
      }
    }
  ];

  const report = await db.db.collection('teams').aggregate(pipeline).toArray();
  res.json(report);
});

router.use('/scores', scoresRouter);

export default router;
