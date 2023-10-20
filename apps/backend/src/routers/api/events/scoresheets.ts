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

router.get('/:scoresheetId', (req: Request, res: Response) => {
  db.getScoresheet({
    _id: new ObjectId(req.params.scoresheetId),
    eventId: new ObjectId(req.params.eventId)
  }).then(scoresheet => {
    res.json(scoresheet);
  });
});

export default router;
