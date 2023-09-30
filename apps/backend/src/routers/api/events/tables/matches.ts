import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getTableMatches(req.params.tableId).then(matches => {
    res.json(matches);
  });
});

router.get('/:matchId', (req: Request, res: Response) => {
  db.getMatch({
    _id: new ObjectId(req.params.matchId),
    table: new ObjectId(req.params.tableId)
  }).then(match => {
    res.json(match);
  });
});

router.get('/:matchId/scoresheet', (req: Request, res: Response) => {
  db.getScoresheet({
    matchId: new ObjectId(req.params.matchId)
  }).then(match => {
    res.json(match);
  });
});

export default router;
