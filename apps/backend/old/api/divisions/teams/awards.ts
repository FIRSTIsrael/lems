import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getTeamAwards(new ObjectId(req.params.teamId)).then(awards => {
    res.json(awards);
  });
});

export default router;
