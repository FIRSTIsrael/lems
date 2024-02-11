import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const scoresheets = await db.getEventScoresheets(new ObjectId(req.params.eventId));
    res.json(scoresheets);
  })
);

router.get('/:scoresheetId', (req: Request, res: Response) => {
  db.getScoresheet({
    _id: new ObjectId(req.params.scoresheetId),
    eventId: new ObjectId(req.params.eventId)
  }).then(scoresheet => {
    res.json(scoresheet);
  });
});

export default router;
