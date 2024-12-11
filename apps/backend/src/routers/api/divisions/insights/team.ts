import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { cvRubricPipeline } from '../../../../lib/mongo/pipelines/cv-rubrics';

const router = express.Router({ mergeParams: true });

router.get(
  '/judging-profile',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: {
          divisionId: new ObjectId(req.params.divisionId),
          teamId: new ObjectId(req.params.teamId)
        }
      },
      ...cvRubricPipeline, // Make cv rubric values
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
  })
);

router.get(
  '/team-stats-summary',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: {
          _id: new ObjectId(req.params.teamId),
          divisionId: new ObjectId(req.params.divisionId)
        }
      },
      {
        $facet: {
          robotPerformance: [
            {
              $lookup: {
                from: 'scoresheets',
                let: { divisionId: '$divisionId', teamId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ['$divisionId', '$$divisionId']
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
                let: { divisionId: '$divisionId', teamId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ['$divisionId', '$$divisionId']
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
                let: { divisionId: '$divisionId', teamId: '$_id' },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ['$divisionId', '$$divisionId']
                          },
                          {
                            $eq: ['$demonstratorAffiliation._id', '$$teamId']
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
  })
);

export default router;
