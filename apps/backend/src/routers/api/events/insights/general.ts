import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/total-teams', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { eventId: new ObjectId(req.params.eventId) }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        registered: { $sum: { $cond: [{ $eq: ['$registered', true] }, 1, 0] } }
      }
    }
  ];

  const report = await db.db.collection('teams').aggregate(pipeline).next();
  res.json({ result: `${report.registered} / ${report.total}` });
});

export default router;
