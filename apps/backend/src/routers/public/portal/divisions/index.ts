import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import scoreboardRouter from './scoreboard';
import awardsRouter from './awards';
import scheduleRouter from './schedule';
import teamsRouter from './teams';

const router = express.Router({ mergeParams: true });

router.get('/:divisionId', (req: Request, res: Response) => {
  // get single event information
});

router.get('/:divisionId/status', (req: Request, res: Response) => {
  // get event status
});

router.use('/:divisionId/scoreboard', scoreboardRouter);

router.use('/:divisionId/awards', awardsRouter);

router.use('/:divisionId/schedule', scheduleRouter);

router.use('/:divisionId/teams', teamsRouter);

export default router;
