import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import dashboardTeamValidator from '../../../../middlewares/dashboard/team-validator';
import scheduleRouter from './schedule';
import exportRouter from './export';
import uploadRouter from './upload';
import { ObjectId } from 'mongodb';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const teams = await db.getDivisionTeams(req.division._id);
    res.json(teams);
  })
);

router.use('/:teamNumber', dashboardTeamValidator);

router.get(
  '/:teamNumber',
  asyncHandler(async (req: Request, res: Response) => {
    const team = await db.getTeam({
      divisionId: new ObjectId(req.division._id),
      number: Number(req.params.teamNumber)
    });
    res.json(team);
  })
);

router.use('/:teamNumber/schedule', scheduleRouter);

router.use('/:teamNumber/export', exportRouter);

router.use('/:teamNumber/upload', uploadRouter);

export default router;
