import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  let scoresheets = await db.getTeamScoresheets(new ObjectId(req.params.teamId));

  if (req.query.stage) scoresheets = scoresheets.filter(s => s.stage === req.query.stage);
  if (req.query.round)
    scoresheets = scoresheets.filter(s => s.round === parseInt(req.query.round as string));

  if (scoresheets.length == 1) return res.json(scoresheets[0]);
  return res.json(scoresheets);
});

export default router;
