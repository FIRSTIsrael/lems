import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';

import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  const scoresheets = await db.getDivisionScoresheets(new ObjectId(req.params.divisionId));
  res.json(scoresheets);
});

router.get('/:scoresheetId', (req: Request, res: Response) => {
  db.getScoresheet({
    _id: new ObjectId(req.params.scoresheetId),
    divisionId: new ObjectId(req.params.divisionId)
  }).then(scoresheet => {
    res.json(scoresheet);
  });
});

export default router;
