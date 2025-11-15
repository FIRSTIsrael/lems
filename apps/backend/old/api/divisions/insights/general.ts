import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';

import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/total-teams', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { divisionId: new ObjectId(req.params.divisionId) }
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
  res.json({ result: `${report.registered ?? 0} / ${report.total ?? 0}` });
});

router.get('/total-tickets', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { divisionId: new ObjectId(req.params.divisionId) }
    },
    {
      $facet: {
        totalDocuments: [{ $count: 'count' }],
        closedDocuments: [
          {
            $match: {
              closed: { $exists: true }
            }
          },
          { $count: 'count' }
        ]
      }
    },
    {
      $project: {
        total: { $arrayElemAt: ['$totalDocuments.count', 0] },
        closed: { $arrayElemAt: ['$closedDocuments.count', 0] }
      }
    }
  ];

  const report = await db.db.collection('tickets').aggregate(pipeline).next();
  res.json({ result: `${report.closed ?? 0} / ${report.total ?? 0}` });
});

router.get('/total-cv-forms', async (req: Request, res: Response) => {
  const pipeline = [
    {
      $match: { divisionId: new ObjectId(req.params.divisionId) }
    },
    {
      $facet: {
        totalDocuments: [{ $count: 'count' }],
        closedDocuments: [
          {
            $match: {
              actionTakenBy: { $ne: '' }
            }
          },
          { $count: 'count' }
        ]
      }
    },
    {
      $project: {
        total: { $arrayElemAt: ['$totalDocuments.count', 0] },
        closed: { $arrayElemAt: ['$closedDocuments.count', 0] }
      }
    }
  ];

  const report = await db.db.collection('core-values-forms').aggregate(pipeline).next();
  res.json({ result: `${report.closed ?? 0} / ${report.total ?? 0}` });
});

export default router;
