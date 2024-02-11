import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import dashboardTeamValidator from '../../../middlewares/dashboard/team-validator';
import { getEventBySalesforceIdAndTeamNumber } from '../../../lib/salesforce-helpers';

const router = express.Router({ mergeParams: true });

router.use('/:teamNumber', dashboardTeamValidator);

router.get(
  '/:teamNumber/schedule',
  asyncHandler(async (req: Request, res: Response) => {
    const teamNumber = Number(req.params.teamNumber);
    if (isNaN(teamNumber)) {
      res.status(400).json({ error: 'INVALID_TEAM_NUMBER' });
      return;
    }
    const eventId = await getEventBySalesforceIdAndTeamNumber(
      req.params.eventSalesforceId,
      teamNumber
    ).then(event => event._id);

    const pipeline = [
      { $match: { _id: eventId } },
      {
        $lookup: {
          from: 'teams',
          let: { teamNumber: teamNumber, eventId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ['$eventId', '$$eventId']
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
                let: { teamId: '$team._id', eventId: '$_id' },
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
                foreignField: 'eventId',
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
                  $concat: [
                    'מקצה ',
                    '$stage',
                    ' ',
                    '$round',
                    ' - שולחן ',
                    '$participants.tableName'
                  ]
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

    const report = await db.db.collection<Event>('events').aggregate(pipeline).toArray();
    res.json(report);
  })
);

export default router;
