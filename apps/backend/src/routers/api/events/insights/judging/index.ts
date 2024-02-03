import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import scoresRouter from './scores';

const router = express.Router({ mergeParams: true });

router.get(
  '/delay',
  asyncHandler(async (req: Request, res: Response) => {
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
  })
);

router.get(
  '/optional-award-nominations',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: {
          eventId: new ObjectId(req.params.eventId),
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
  })
);

router.get(
  '/robot-room-correlation-to-robot-game',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $lookup: {
          from: 'rubrics',
          let: { teamId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$teamId', '$$teamId']
                    },
                    {
                      $in: ['$status', ['ready', 'waiting-for-review', 'completed']]
                    },
                    {
                      $eq: ['$category', 'robot-design']
                    }
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
                    {
                      $eq: ['$teamId', '$$teamId']
                    },
                    {
                      $eq: ['$stage', 'ranking']
                    },
                    {
                      $eq: ['$status', 'ready']
                    }
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
            $and: [
              {
                $eq: [{ $size: '$rubric' }, 1]
              },
              {
                $gt: [{ $size: '$scoresheets' }, 0]
              }
            ]
          }
        }
      },
      {
        $project: {
          rubric: { $arrayElemAt: ['$rubric', 0] },
          topRobotGameScore: {
            $max: '$scoresheets.data.score'
          }
        }
      },
      {
        $project: {
          _id: false,
          averageRobotDesignScore: '$rubric.averageRobotDesignScore',
          topRobotGameScore: true
        }
      }
    ];

    const report = await db.db.collection('teams').aggregate(pipeline).toArray();
    res.json(report);
  })
);

router.get(
  '/validate-csv-readiness',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: { eventId: new ObjectId(req.params.eventId), status: { $ne: 'empty' } }
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
          unscored: {
            $sum: {
              $map: {
                input: '$scores',
                as: 'element',
                in: {
                  $cond: {
                    if: { $eq: ['$$element.v.value', 0] },
                    then: 1,
                    else: 0
                  }
                }
              }
            }
          }
        }
      },
      {
        $match: {
          unscored: { $gt: 0 }
        }
      },
      {
        $lookup: {
          from: 'teams',
          localField: 'teamId',
          foreignField: '_id',
          as: 'team'
        }
      },
      {
        $unwind: '$team'
      },
      {
        $group: {
          _id: '$category',
          unscoredTeams: { $addToSet: '$team' }
        }
      }
    ];

    const report = await db.db.collection('rubrics').aggregate(pipeline).toArray();
    report.sort((a, b) => a.id.localeCompare(b.id));
    res.json(report);
  })
);

router.use('/scores', scoresRouter);

export default router;
