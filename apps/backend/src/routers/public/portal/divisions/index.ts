import express, { Request, Response } from 'express';
import dayjs from 'dayjs';
import asyncHandler from 'express-async-handler';
import { ObjectId, WithId } from 'mongodb';
import * as db from '@lems/database';
import scoreboardRouter from './scoreboard';
import awardsRouter from './awards';
import scheduleRouter from './schedule';
import teamsRouter from './teams';
import divisionValidator from '../../../../middlewares/portal/division-validator';
import { RobotGameMatch, JudgingSession } from '@lems/types';

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
    res.json({
      id: String(_id),
      name: event.name,
      color,
      date: event.startDate,
      location: event.location,
      isDivision: event.enableDivisions,
      subtitle: event.enableDivisions ? `בית ${name}` : undefined,
      routing: req.division.routing
    });
  })
);

router.get(
  '/status',
  asyncHandler(async (req: Request, res: Response) => {
    const event = await db.getFllEvent({ _id: new ObjectId(req.division.eventId) });
    if (!event) {
      res.status(404).send('Event not found');
      return;
    }

    const isLive = dayjs(event.startDate).isSame(dayjs(), 'day');

    const divisionState = await db.getDivisionState({
      divisionId: new ObjectId(req.division._id)
    });
    if (!divisionState) {
      res.status(404).send('Event/Division state not found');
      return;
    }

    const matches = await db.getDivisionMatches(new ObjectId(req.division._id));
    if (!matches) {
      res.status(404).send('Matches not found');
      return;
    }

    const sessions = await db.getDivisionSessions(new ObjectId(req.division._id));

    const { currentStage, completed, currentRound, activeMatch, loadedMatch } = divisionState;
    const currentSession: WithId<JudgingSession> | undefined = sessions.find(
      session =>
        String(session.number) === String(divisionState.currentSession) &&
        session.status !== 'completed'
    );

    let currentMatch: WithId<RobotGameMatch> | undefined;
    if (loadedMatch) {
      currentMatch = matches.find(match => match._id.equals(loadedMatch));
    } else if (activeMatch) {
      currentMatch = matches.find(match => match._id.equals(activeMatch));
    } else {
      currentMatch = matches.find(match => match.status !== 'completed' && match.stage !== 'test');
    }

    res.json({
      isLive,
      isCompleted: completed,
      field: {
        stage: currentStage,
        round: currentRound,
        match: { number: currentMatch?.number, time: currentMatch?.scheduledTime }
      },
      judging: { session: { number: currentSession?.number, time: currentSession?.scheduledTime } }
    });
  })
);

router.use('/scoreboard', scoreboardRouter);

router.use('/awards', awardsRouter);

router.use('/schedule', scheduleRouter);

router.use('/teams', teamsRouter);

export default router;
