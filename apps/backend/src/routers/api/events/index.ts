import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { EventState, RoleTypes } from '@lems/types';
import * as db from '@lems/database';
import eventValidator from '../../../middlewares/event-validator';
import sessionsRouter from './sessions';
import matchesRouter from './matches';
import roomsRouter from './rooms';
import awardsRouter from './awards';
import usersRouter from './users';
import teamsRouter from './teams';
import rubricsRouter from './rubrics';
import tablesRouter from './tables';
import scoresheetRouter from './scoresheets';
import ticketsRouter from './tickets';
import cvFormsRouter from './cv-forms';
import exportRouter from './export';
import insightsRouter from './insights';
import roleValidator from '../../../middlewares/role-validator';

const router = express.Router({ mergeParams: true });

router.use('/:eventId', eventValidator);

router.get('/:eventId', (req: Request, res: Response) => {
  db.getEvent({ _id: new ObjectId(req.params.eventId) }).then(event => {
    if (!req.query.withSchedule) delete event.schedule;
    res.json(event);
  });
});

router.get('/:eventId/state', (req: Request, res: Response) => {
  db.getEventState({ eventId: new ObjectId(req.params.eventId) }).then(eventState =>
    res.json(eventState)
  );
});

router.put('/:eventId/state', (req: Request, res: Response) => {
  const body: Partial<EventState> = { ...req.body };
  if (!body) return res.status(400).json({ ok: false });

  console.log(`⏬ Updating Event state for event ${req.params.eventId}`);
  db.updateEventState({ eventId: new ObjectId(req.params.eventId) }, body).then(task => {
    if (task.acknowledged) {
      console.log('✅ Event state updated!');
      return res.json({ ok: true, id: task.upsertedId });
    } else {
      console.log('❌ Could not update Event state');
      return res.status(500).json({ ok: false });
    }
  });
});

router.use('/:eventId/awards', roleValidator('judge-advisor'), awardsRouter);

router.use('/:eventId/rooms', roomsRouter);

router.use('/:eventId/tables', tablesRouter);

router.use('/:eventId/users', roleValidator([]), usersRouter);

router.use('/:eventId/sessions', roleValidator([...RoleTypes]), sessionsRouter);

router.use('/:eventId/matches', matchesRouter);

router.use('/:eventId/teams', teamsRouter);

router.use('/:eventId/rubrics', roleValidator(['judge-advisor', 'lead-judge']), rubricsRouter);

router.use('/:eventId/scoresheets', roleValidator(['audience-display', 'head-referee', 'reports', 'judge']), scoresheetRouter);

router.use('/:eventId/tickets', roleValidator(['pit-admin', 'tournament-manager']), ticketsRouter);

router.use('/:eventId/cv-forms', roleValidator(['judge-advisor', 'tournament-manager']), cvFormsRouter);

router.use('/:eventId/export', roleValidator('judge-advisor'), exportRouter);

router.use('/:eventId/insights', roleValidator(["head-referee", "judge-advisor", "lead-judge", "tournament-manager"]), insightsRouter);

export default router;
