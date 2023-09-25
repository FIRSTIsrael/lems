import express, { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getTeamScoresheets(new ObjectId(req.params.teamId)).then(scoresheets => res.json(scoresheets));
});

export default router;
