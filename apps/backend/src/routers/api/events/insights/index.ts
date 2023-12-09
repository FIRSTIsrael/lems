import express, { Request, Response } from 'express';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/validate-csv-readiness', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { status: { $ne: 'empty' } }
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
        teamId: true,
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
      $group: {
        _id: '$category',
        unscoredTeams: { $addToSet: '$team' }
      }
    }
  ];

  const report = await db.db.collection('rubrics').aggregate(pipeline).toArray();
  res.json(report);
});

export default router;
