import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getEventTeams(new ObjectId(req.params.eventId)).then(teams => {
    res.json(teams);
  });
});

export default router;
