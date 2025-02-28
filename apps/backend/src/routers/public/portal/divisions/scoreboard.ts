import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { Scoresheet } from '@lems/types';
import * as db from '@lems/database';
import asyncHandler from 'express-async-handler';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const divisionState = await db.getDivisionState({
      divisionId: new ObjectId(req.division._id)
    });
    if (!divisionState) {
      res.status(404).send('Event/Division state not found');
      return;
    }

    const { currentStage } = divisionState;

    const pipeline = [
      {
        $match: {
          divisionId: new ObjectId(req.params.divisionRouting),
          status: 'ready',
          stage: currentStage
        }
      },
      {
        $group: {
          _id: null,
          maxRound: { $max: '$round' },
          docs: { $push: '$$ROOT' }
        }
      },
      { $unwind: '$docs' },
      {
        $group: {
          _id: '$docs.teamId',
          maxRound: { $first: '$maxRound' },
          scoresByRound: {
            $push: {
              round: '$docs.round',
              score: '$docs.data.score'
            }
          }
        }
      },
      {
        $project: {
          teamId: '$_id',
          scores: {
            $map: {
              input: { $range: [0, '$maxRound'] },
              as: 'roundIndex',
              in: {
                $let: {
                  vars: {
                    roundScore: {
                      $filter: {
                        input: '$scoresByRound',
                        as: 'score',
                        cond: { $eq: ['$$score.round', { $add: ['$$roundIndex', 1] }] }
                      }
                    }
                  },
                  in: {
                    $ifNull: [{ $arrayElemAt: ['$$roundScore.score', 0] }, null]
                  }
                }
              }
            }
          }
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
        $project: {
          scores: true,
          team: { $arrayElemAt: ['$team', 0] },
          maxScore: { $max: '$scores' }
        }
      },
      {
        $project: {
          _id: false,
          scores: true,
          maxScore: true,
          team: {
            id: '$team._id',
            name: '$team.name',
            number: '$team.number',
            affiliation: '$team.affiliation'
          }
        }
      }
    ];

    const scores = await db.db.collection<Scoresheet>('scoresheets').aggregate(pipeline).toArray();
    res.json(scores);
  })
);

export default router;
