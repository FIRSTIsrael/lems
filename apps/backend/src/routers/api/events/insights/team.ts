import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/judging-profile', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { eventId: new ObjectId(req.params.eventId), teamId: new ObjectId(req.params.teamId) }
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
        average: { $avg: '$averageScore' }
      }
    },
    { $addFields: { category: '$_id', fullMark: 4 } }
  ];

  const report = await db.db.collection('rubrics').aggregate(pipeline).toArray();
  report.sort((a, b) => a.category.localeCompare(b.category));
  res.json(report);
});

router.get('/information', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { _id: new ObjectId(req.params.teamId), eventId: new ObjectId(req.params.eventId) }
    },
    {
      $facet: {
        robotPerformance: [
          {
            $lookup: {
              from: 'scoresheets',
              let: { eventId: '$eventId', teamId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$eventId', '$$eventId']
                        },
                        {
                          $eq: ['$teamId', '$$teamId']
                        },
                        {
                          $eq: ['$stage', 'ranking']
                        }
                      ]
                    }
                  }
                },
                {
                  $group: {
                    _id: null,
                    scores: { $push: '$data.score' }
                  }
                }
              ],
              as: 'scores'
            }
          }
        ],
        awards: [
          {
            $lookup: {
              from: 'awards',
              let: { eventId: '$eventId', teamId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$eventId', '$$eventId']
                        },
                        {
                          $eq: ['$winner._id', '$$teamId']
                        }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    _id: false,
                    name: true,
                    place: true
                  }
                }
              ],
              as: 'awards'
            }
          }
        ],
        cvForms: [
          {
            $lookup: {
              from: 'core-values-forms',
              let: { eventId: '$eventId', teamNumber: '$number' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$eventId', '$$eventId']
                        },
                        {
                          $eq: ['$demonstratorAffiliation', { $toString: '$$teamNumber' }]
                        }
                      ]
                    }
                  }
                },
                {
                  $project: {
                    _id: false,
                    severity: true
                  }
                }
              ],
              as: 'cvForms'
            }
          }
        ]
      }
    },
    {
      $addFields: {
        robotPerformance: { $arrayElemAt: ['$robotPerformance', 0] },
        awards: { $arrayElemAt: ['$awards', 0] },
        cvForms: { $arrayElemAt: ['$cvForms', 0] }
      }
    },
    {
      $addFields: {
        scores: '$robotPerformance.scores',
        awards: '$awards.awards',
        cvForms: '$cvForms.cvForms'
      }
    },
    {
      $addFields: {
        scores: { $arrayElemAt: ['$scores', 0] }
      }
    },
    {
      $project: {
        _id: false,
        scores: '$scores.scores',
        awards: true,
        cvForms: true
      }
    },
    {
      $addFields: {
        robotPerformance: {
          maxScore: { $max: '$scores' },
          stdDev: { $stdDevPop: '$scores' },
          averageScore: { $avg: '$scores' }
        }
      }
    },
    {
      $addFields: {
        'robotPerformance.relStdDev': {
          $divide: [
            { $multiply: ['$robotPerformance.stdDev', 100] },
            '$robotPerformance.averageScore'
          ]
        }
      }
    }
  ];

  const report = await db.db.collection('teams').aggregate(pipeline).next();
  res.json(report);
});

export default router;
