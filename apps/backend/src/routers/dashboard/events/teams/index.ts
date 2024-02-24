import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import dashboardTeamValidator from '../../../../middlewares/dashboard/team-validator';
import scheduleRouter from './schedule';
import exportRouter from './export';
import uploadRouter from './upload';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const teams = await db.getEventTeams(req.event._id);
    res.json(teams);
  })
);

router.use('/:teamNumber', dashboardTeamValidator);

router.use('/:teamNumber/schedule', scheduleRouter);

router.use('/:teamNumber/export', exportRouter);

router.use('/:teamNumber/upload', uploadRouter);

export default router;
