import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/judging-profile', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { eventId: new ObjectId(req.params.eventId), teamId: new ObjectId(req.params.teamId) }
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
        averageScore: { $avg: '$scores.v.value' }
      }
    },
    {
      $group: {
        _id: '$category',
        average: { $avg: '$averageScore' }
      }
    },
    { $addFields: { category: '$_id', fullMark: 4 } }
  ];

  const report = await db.db.collection('rubrics').aggregate(pipeline).toArray();
  report.sort((a, b) => a.category.localeCompare(b.category));
  res.json(report);
});

export default router;
