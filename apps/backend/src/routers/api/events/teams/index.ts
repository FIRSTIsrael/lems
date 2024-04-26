import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import rubricsRouter from './rubrics';
import scoresheetsRouter from './scoresheets';
import { RoleTypes } from '@lems/types';
import roleValidator from '../../../../middlewares/role-validator';

const router = express.Router({ mergeParams: true });

router.get('/', roleValidator([...RoleTypes]), (req: Request, res: Response) => {
  db.getEventTeams(new ObjectId(req.params.eventId)).then(teams => {
    res.json(teams);
  });
});

router.get('/:teamId', (req: Request, res: Response) => {
  db.getTeam({
    _id: new ObjectId(req.params.teamId),
    eventId: new ObjectId(req.params.eventId)
  }).then(team => {
    res.json(team);
  });
});

// These apis are used when exporting through the dashboad. The admin user makes a server side request
router.use('/:teamId/rubrics', roleValidator([]), rubricsRouter);

router.use('/:teamId/scoresheets', roleValidator([]), scoresheetsRouter);

export default router;
