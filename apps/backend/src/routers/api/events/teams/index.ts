import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import rubricsRouter from './rubrics';
import scoresheetsRouter from './scoresheets';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getEventTeams(new ObjectId(req.params.divisionId)).then(teams => {
    res.json(teams);
  });
});

router.get('/:teamId', (req: Request, res: Response) => {
  db.getTeam({
    _id: new ObjectId(req.params.teamId),
    divisionId: new ObjectId(req.params.divisionId)
  }).then(team => {
    res.json(team);
  });
});

router.use('/:teamId/rubrics', rubricsRouter);

router.use('/:teamId/scoresheets', scoresheetsRouter);

export default router;
