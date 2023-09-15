import express, { NextFunction, Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import rubricsRouter from './rubrics';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getEventTeams(new ObjectId(req.params.eventId)).then(teams => {
    res.json(teams);
  });
});

router.get('/:teamId', (req: Request, res: Response) => {
  db.getTeam({
    _id: new ObjectId(req.params.teamId),
    event: new ObjectId(req.params.eventId)
  }).then(team => {
    res.json(team);
  });
});

router.use('/:teamId/rubrics', rubricsRouter);

export default router;
