import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import eventValidator from '../../../middlewares/event-validator';
import sessionsRouter from './sessions';
import matchesRouter from './matches';
import roomsRouter from './rooms';
import usersRouter from './users';
import teamsRouter from './teams';
import rubricsRouter from './rubrics';
import tablesRouter from './tables';
import scoresheetRouter from './scoresheets';
import ticketsRouter from './tickets';

const router = express.Router({ mergeParams: true });

router.use('/:eventId', eventValidator);

router.get('/:eventId', (req: Request, res: Response) => {
  db.getEvent({ _id: new ObjectId(req.params.eventId) }).then(event => {
    if (req.query.withSchedule) return res.json(event);

    const { schedule, ...rest } = event;
    res.json(rest);
  });
});

router.get('/:eventId/state', (req: Request, res: Response) => {
  db.getEventState({ event: new ObjectId(req.params.eventId) }).then(eventState =>
    res.json(eventState)
  );
});

router.use('/:eventId/rooms', roomsRouter);

router.use('/:eventId/tables', tablesRouter);

router.use('/:eventId/users', usersRouter);

router.use('/:eventId/sessions', sessionsRouter);

router.use('/:eventId/matches', matchesRouter);

router.use('/:eventId/teams', teamsRouter);

router.use('/:eventId/rubrics', rubricsRouter);

router.use('/:eventId/scoresheets', scoresheetRouter);

router.use('/:eventId/tickets', ticketsRouter);

export default router;
