import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import judgingInsightsRouter from './judging/index';
import fieldInsightsRouter from './field/index';
import generalInsightsRouter from './general';
import teamInsightsRouter from './team';

const router = express.Router({ mergeParams: true });

// TODO: Move to another router, maybe genral or judging
router.get('/validate-csv-readiness', async (req: Request, res: Response) => {
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
});

router.use('/judging', judgingInsightsRouter);
router.use('/field', fieldInsightsRouter);
router.use('/general', generalInsightsRouter);
router.use('/team/:teamId', teamInsightsRouter);

export default router;
