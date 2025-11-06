import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';

import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  const sessions = await db.getRoomSessions(new ObjectId(req.params.roomId));
  let rubrics = [];

  await Promise.all(
    sessions.map(async session => {
      const teamRubrics = await db.getTeamRubrics(session.teamId);
      rubrics = rubrics.concat(teamRubrics);
    })
  );

  res.json(rubrics);
});

export default router;
