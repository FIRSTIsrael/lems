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
        $match: { divisionId: new ObjectId(req.params.divisionId), status: 'ready' }
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
  })
);

router.get(
  '/average-median/top-scores',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: {
          divisionId: new ObjectId(req.params.divisionId),
          status: 'ready',
          stage: 'ranking'
        }
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
  })
);

router.get(
  '/tables',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: { divisionId: new ObjectId(req.params.divisionId), status: 'ready' }
      },
      {
        $lookup: {
          from: 'matches',
          let: {
            stage: '$stage',
            round: '$round',
            teamId: '$teamId'
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$stage', '$$stage']
                    },
                    {
                      $eq: ['$round', '$$round']
                    },
                    {
                      $in: ['$$teamId', '$participants.teamId']
                    }
                  ]
                }
              }
            }
          ],
          as: 'match'
        }
      },
      {
        $project: {
          _id: false
        }
      },
      {
        $addFields: {
          match: { $arrayElemAt: ['$match', 0] },
          score: '$data.score',
          tokens: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$data.missions',
                  as: 'mission',
                  cond: { $eq: ['$$mission.id', 'pt'] },
                  limit: 1
                }
              },
              0
            ]
          }
        }
      },
      { $addFields: { tokens: { $arrayElemAt: ['$tokens.clauses', 0] } } },
      { $addFields: { tokens: '$tokens.value' } },
      { $unwind: '$match.participants' },
      { $match: { $expr: { $eq: ['$match.participants.teamId', '$teamId'] } } },
      {
        $project: {
          score: true,
          tokens: { $toInt: '$tokens' },
          tableId: '$match.participants.tableId'
        }
      },
      {
        $group: {
          _id: '$tableId',
          averageScore: { $avg: '$score' },
          averageTokens: { $avg: '$tokens' }
        }
      },
      {
        $lookup: {
          from: 'tables',
          localField: '_id',
          foreignField: '_id',
          as: 'table'
        }
      },
      {
        $project: {
          _id: false,
          averageScore: true,
          averageTokens: true,
          table: { $arrayElemAt: ['$table.name', 0] }
        }
      }
    ];

    const report = await db.db.collection('scoresheets').aggregate(pipeline).toArray();
    report.sort((a, b) => a.table.localeCompare(b.table));
    res.json(report);
  })
);

router.get(
  '/highest-score',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: {
          divisionId: new ObjectId(req.params.divisionId),
          status: 'ready',
          stage: 'ranking'
        }
      },
      {
        $group: {
          _id: null,
          result: { $max: '$data.score' }
        }
      },
      {
        $project: {
          _id: false,
          result: true
        }
      }
    ];

    const report = await db.db.collection('scoresheets').aggregate(pipeline).next();
    res.json(report);
  })
);

router.get(
  '/consistency',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: { divisionId: new ObjectId(req.params.divisionId), status: 'ready' }
      },
      {
        $group: {
          _id: '$teamId',
          scores: { $push: '$data.score' }
        }
      },
      {
        $addFields: {
          stdDev: { $stdDevPop: '$scores' },
          averageScore: { $avg: '$scores' }
        }
      },
      {
        $addFields: {
          relStdDev: { $divide: [{ $multiply: ['$stdDev', 100] }, '$averageScore'] }
        }
      },
      {
        $lookup: {
          from: 'teams',
          localField: '_id',
          foreignField: '_id',
          as: 'team'
        }
      },
      { $unwind: '$team' },
      {
        $project: {
          _id: false,
          id: '$_id',
          teamNumber: '$team.number',
          teamName: '$team.name',
          teamAffiliation: '$team.affiliation',
          averageScore: true,
          stdDev: true,
          relStdDev: true
        }
      },
      {
        $group: {
          _id: null,
          rows: { $push: '$$ROOT' },
          avgRelStdDev: { $avg: '$relStdDev' }
        }
      }
    ];

    const report = await db.db.collection('scoresheets').aggregate(pipeline).next();
    res.json(report);
  })
);

export default router;
