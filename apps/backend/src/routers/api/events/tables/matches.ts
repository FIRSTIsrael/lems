import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getTableMatches(req.params.tableId).then(matches => {
    res.json(matches);
  });
});

router.get('/:matchId/scoresheet', async (req: Request, res: Response) => {
  const match = await db.getMatch({ _id: new ObjectId(req.params.matchId) });
  const teamId = match.participants.find(p => p.tableId.toString() === req.params.tableId).teamId;

  db.getScoresheet({
    matchId: new ObjectId(req.params.matchId),
    teamId: new ObjectId(teamId)
  }).then(scoresheet => {
    res.json(scoresheet);
  });
});

export default router;
