import express, { Request, Response } from 'express';
import * as db from '@lems/database';
import { Division } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  const teamNumber = req.teamNumber;
  const divisionId = req.division._id;

  const pipeline = [
    { $match: { _id: divisionId } },
    {
      $lookup: {
        from: 'teams',
        let: { teamNumber: teamNumber, divisionId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ['$divisionId', '$$divisionId']
                  },
                  {
                    $eq: ['$number', '$$teamNumber']
                  }
                ]
              }
            }
          }
        ],
        as: 'team'
      }
    },
    {
      $project: {
        team: { $arrayElemAt: ['$team', 0] },
        schedule: {
          $filter: {
            input: '$schedule',
            as: 'schedule',
            cond: { $eq: ['$$schedule.showOnDashboard', true] }
          }
        }
      }
    },
    {
      $facet: {
        generalSchedule: [
          { $project: { schedule: true } },
          { $unwind: '$schedule' },
          { $replaceRoot: { newRoot: '$schedule' } },
          { $project: { detail: '$name', time: '$startTime' } }
        ],
        sessionSchedule: [
          {
            $lookup: {
              from: 'sessions',
              let: { teamId: '$team._id', divisionId: '$_id' },
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
                        }
                      ]
                    }
                  }
                }
              ],
              as: 'session'
            }
          },
          { $addFields: { session: { $arrayElemAt: ['$session', 0] } } },
          { $replaceRoot: { newRoot: '$session' } },
          { $project: { _id: false, scheduledTime: true, roomId: true } },
          {
            $lookup: {
              from: 'rooms',
              localField: 'roomId',
              foreignField: '_id',
              as: 'room'
            }
          },
          { $addFields: { room: { $arrayElemAt: ['$room', 0] } } },
          {
            $project: {
              detail: { $concat: ['מפגש שיפוט - חדר ', '$room.name'] },
              time: '$scheduledTime'
            }
          }
        ],
        matchSchedule: [
          {
            $lookup: {
              from: 'matches',
              localField: '_id',
              foreignField: 'divisionId',
              as: 'matches'
            }
          },
          { $unwind: '$matches' },
          {
            $unwind: {
              path: '$matches.participants',
              preserveNullAndEmptyArrays: true
            }
          },
          { $match: { $expr: { $eq: ['$matches.participants.teamId', '$team._id'] } } },
          { $replaceRoot: { newRoot: '$matches' } },
          {
            $addFields: {
              round: { $toString: '$round' },
              stage: {
                $cond: { if: { $eq: ['$stage', 'practice'] }, then: 'אימונים', else: 'דירוג' }
              }
            }
          },
          {
            $project: {
              _id: false,
              time: '$scheduledTime',
              detail: {
                $concat: ['מקצה ', '$stage', ' ', '$round', ' - שולחן ', '$participants.tableName']
              }
            }
          }
        ]
      }
    },
    {
      $project: {
        schedule: { $concatArrays: ['$generalSchedule', '$sessionSchedule', '$matchSchedule'] }
      }
    },
    {
      $addFields: {
        schedule: { $sortArray: { input: '$schedule', sortBy: { time: 1 } } }
      }
    },
    { $unwind: '$schedule' },
    { $replaceRoot: { newRoot: '$schedule' } }
  ];

  const report = await db.db.collection<Division>('divisions').aggregate(pipeline).toArray();
  res.json(report);
});

export default router;
