import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { DivisionState } from '@lems/types';
import * as db from '@lems/database';
import divisionValidator from '../../../middlewares/division-validator';
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
import deliberationsRouter from './deliberations';

const router = express.Router({ mergeParams: true });

router.use('/:divisionId', divisionValidator);

router.get('/:divisionId', (req: Request, res: Response) => {
  db.getDivision({ _id: new ObjectId(req.params.divisionId) }).then(division => {
    if (!req.query.withSchedule) delete division.schedule;
    res.json(division);
  });
});

router.get('/:divisionId/state', (req: Request, res: Response) => {
  db.getDivisionState({ divisionId: new ObjectId(req.params.divisionId) }).then(divisionState =>
    res.json(divisionState)
  );
});

router.put('/:divisionId/state', (req: Request, res: Response) => {
  const body: Partial<DivisionState> = { ...req.body };
  if (!body) return res.status(400).json({ ok: false });

  console.log(`⏬ Updating Division state for division ${req.params.divisionId}`);
  db.updateDivisionState({ divisionId: new ObjectId(req.params.divisionId) }, body).then(task => {
    if (task.acknowledged) {
      console.log('✅ Division state updated!');
      return res.json({ ok: true, id: task.upsertedId });
    } else {
      console.log('❌ Could not update Division state');
      return res.status(500).json({ ok: false });
    }
  });
});

router.use('/:divisionId/awards', awardsRouter);

router.use('/:divisionId/rooms', roomsRouter);

router.use('/:divisionId/tables', tablesRouter);

router.use('/:divisionId/users', usersRouter);

router.use('/:divisionId/sessions', sessionsRouter);

router.use('/:divisionId/matches', matchesRouter);

router.use('/:divisionId/teams', teamsRouter);

router.use('/:divisionId/rubrics', rubricsRouter);

router.use('/:divisionId/scoresheets', scoresheetRouter);

router.use('/:divisionId/tickets', ticketsRouter);

router.use('/:divisionId/cv-forms', cvFormsRouter);

router.use('/:divisionId/export', exportRouter);

router.use('/:divisionId/insights', insightsRouter);

router.use('/:divisionId/deliberations', deliberationsRouter);

export default router;
