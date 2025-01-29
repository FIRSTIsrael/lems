import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import scoreboardRouter from './scoreboard';
import awardsRouter from './awards';
import scheduleRouter from './schedule';
import teamsRouter from './teams';
import divisionValidator from '../../../../middlewares/portal/division-validator';

const router = express.Router({ mergeParams: true });

router.use('/', divisionValidator);

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const event = await db.getFllEvent({ _id: new ObjectId(req.division.eventId) });
    if (!event) {
      res.status(404).send('Event not found');
      return;
    }
    const { _id, name, color } = req.division;
    res.json({ id: String(_id), name, color, date: event.startDate, location: event.location });
  })
);

router.get('/status', (req: Request, res: Response) => {
  // get event status
});

router.use('/scoreboard', scoreboardRouter);

router.use('/awards', awardsRouter);

router.use('/schedule', scheduleRouter);

router.use('/teams', teamsRouter);

export default router;
