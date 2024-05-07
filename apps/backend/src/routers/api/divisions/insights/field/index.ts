import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import scoresRouter from './scores';
import missionsRouter from './missions';

const router = express.Router({ mergeParams: true });

router.get(
  '/cycle-time',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [
      {
        $match: {
          divisionId: new ObjectId(req.params.divisionId),
          stage: req.query.stage || 'practice',
          status: 'completed'
        }
      },
      {
        $project: {
          _id: true,
          round: true,
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
          _id: 0,
          allDocuments: { $push: '$$ROOT' }
        }
      },
      {
        $project: {
          everyMatchWithPreviousStartTime: {
            $zip: {
              inputs: [
                '$allDocuments',
                { $concatArrays: [[null], '$allDocuments.startTime'] },
                { $concatArrays: [[1], '$allDocuments.round'] }
              ]
            }
          }
        }
      },
      { $unwind: { path: '$everyMatchWithPreviousStartTime' } },
      {
        $replaceWith: {
          $mergeObjects: [
            { $arrayElemAt: ['$everyMatchWithPreviousStartTime', 0] },
            { previousMatchStart: { $arrayElemAt: ['$everyMatchWithPreviousStartTime', 1] } },
            { previousMatchRound: { $arrayElemAt: ['$everyMatchWithPreviousStartTime', 2] } }
          ]
        }
      },
      {
        $match: {
          $expr: { $eq: ['$round', '$previousMatchRound'] },
          previousMatchStart: { $ne: null }
        }
      },
      {
        $project: {
          _id: false,
          delay: true,
          cycleTime: {
            $dateDiff: {
              startDate: '$previousMatchStart',
              endDate: '$startTime',
              unit: 'second'
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          cycleTimes: { $push: '$cycleTime' },
          averageDelay: { $avg: '$delay' }
        }
      },
      {
        $project: {
          average: { $avg: '$cycleTimes' },
          median: {
            $median: {
              input: '$cycleTimes',
              method: 'approximate'
            }
          },
          highest: { $max: '$cycleTimes' },
          lowest: { $min: '$cycleTimes' },
          percentile95: {
            $arrayElemAt: [
              {
                $percentile: {
                  input: '$cycleTimes',
                  p: [0.95],
                  method: 'approximate'
                }
              },
              0
            ]
          },
          averageDelay: true
        }
      }
    ];

    const report = await db.db.collection('matches').aggregate(pipeline).next();
    res.json(report);
  })
);

router.use('/scores', scoresRouter);
router.use('/missions', missionsRouter);

export default router;
