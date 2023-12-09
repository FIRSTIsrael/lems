import express, { Request, Response } from 'express';
import * as db from '@lems/database';
import { JudgingCategoryTypes } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get('/validate-csv-readiness', async (req: Request, res: Response) => {
  const category = req.query.category;

  if (!JudgingCategoryTypes.some(c => category === c))
    return res.status(400).json({ error: 'Invalid Category' });

  const pipeline = [
    {
      $match: { category, status: { $ne: 'empty' } }
    },
    {
      $project: {
        teamId: true,
        scores: { $objectToArray: '$data.values' }
      }
    },
    {
      $project: {
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
    }
  ];

  const report = await db.db.collection('rubrics').aggregate(pipeline).toArray();
  res.json(report);
});

export default router;
