import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get(':teamNumber/schedule', async (req: Request, res: Response) => {
  const pipeline = [
    { $match: { salesforceId: req.params.eventSalesforceId } },
    {
      $lookup: {
        from: 'teams',
        let: { teamNumber: req.params.teamNumber },
        pipeline: [
          {
            $match: { _id: '$$teamId' }
          }
        ],
        as: 'team'
      }
    },
    {
      $addFields: {
        team: { $arrayElemAt: ['$team', 0] }
      }
    }
  ];
});

export default router;