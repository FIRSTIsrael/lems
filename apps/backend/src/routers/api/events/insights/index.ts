import express, { Request, Response } from 'express';
import * as db from '@lems/database';
import { JudgingCategoryTypes } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get('/validate-csv-readiness', async (req: Request, res: Response) => {
  const category = req.query.category;

  //TODO: fix validation
  // if (!((category as string) in JudgingCategoryTypes))
  //   return res.status(400).json({ error: 'Invalid Category' });

  const pipeline = [
    {
      $match: { category, status: { $ne: 'empty' } }
    },
    {
      $project: {
        'data.values': { $objectToArray: '$scores' }
      }
    },
    {
      $match: {
        $expr: {
          $eq: [{ $size: { $setDifference: ['$scores.v', [0]] } }, 1]
        }
      }
    }
  ];

  //TODO: fix, getting error
  //MongoServerError: PlanExecutor error during aggregation :: caused by :: The argument to $size must be an array, but was of type: null

  const report = await db.db.collection('rubrics').aggregate(pipeline).toArray();
  res.json(report);
});

export default router;
