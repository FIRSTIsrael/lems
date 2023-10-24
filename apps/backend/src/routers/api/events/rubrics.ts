import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  const teams = await db.getEventTeams(new ObjectId(req.params.eventId));
  let rubrics = [];

  await Promise.all(
    teams.map(async team => {
      const teamRubrics = await db.getTeamRubrics(team._id);
      rubrics = rubrics.concat(teamRubrics);
    })
  );

  res.json(rubrics);
});

export default router;
