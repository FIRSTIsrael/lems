import express, { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  const teams = await db.getEventTeams(new ObjectId(req.params.eventId));
  let scoresheets = [];

  await Promise.all(
    teams.map(async team => {
      const teamScoresheets = await db.getTeamScoresheets(team._id);
      scoresheets = scoresheets.concat(teamScoresheets);
    })
  );

  res.json(scoresheets);
});

export default router;
