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
import roleValidator from '../../../middlewares/role-validator';

const router = express.Router({ mergeParams: true });

router.use('/:divisionId', divisionValidator);

router.get('/:divisionId', async (req: Request, res: Response) => {
  let division;
  if (req.query.withEvent) {
    division = await db.getDivisionWithEvent({ _id: new ObjectId(req.params.divisionId) });
  } else {
    division = await db.getDivision({ _id: new ObjectId(req.params.divisionId) });
  }

  if (!req.query.withSchedule) delete division.schedule;
  res.json(division);
});

router.get('/:divisionId/state', (req: Request, res: Response) => {
  db.getDivisionState({ divisionId: new ObjectId(req.params.divisionId) }).then(divisionState =>
    res.json(divisionState)
  );
});

router.put(
  '/:divisionId/state',
  roleValidator('tournament-manager'),
  (req: Request, res: Response) => {
    const body: Partial<DivisionState> = { ...req.body };
    if (!body) {
      res.status(400).json({ ok: false });
      return;
    }

    console.log(`⏬ Updating Division state for division ${req.params.divisionId}`);
    db.updateDivisionState({ divisionId: new ObjectId(req.params.divisionId) }, body).then(task => {
      if (task.acknowledged) {
        console.log('✅ Division state updated!');
        res.json({ ok: true, id: task.upsertedId });
        return;
      } else {
        console.log('❌ Could not update Division state');
        res.status(500).json({ ok: false });
        return;
      }
    });
  }
);

router.use('/:divisionId/awards', awardsRouter);

router.use('/:divisionId/rooms', roomsRouter);

router.use('/:divisionId/tables', tablesRouter);

router.use('/:divisionId/users', roleValidator([]), usersRouter);

router.use('/:divisionId/sessions', sessionsRouter);

router.use('/:divisionId/matches', matchesRouter);

router.use('/:divisionId/teams', teamsRouter);

router.use(
  '/:divisionId/rubrics',
  roleValidator(['judge-advisor', 'lead-judge', 'judge']),
  rubricsRouter
);

router.use('/:divisionId/scoresheets', scoresheetRouter);

router.use(
  '/:divisionId/tickets',
  roleValidator(['pit-admin', 'tournament-manager']),
  ticketsRouter
);

router.use(
  '/:divisionId/cv-forms',
  roleValidator(['judge-advisor', 'tournament-manager', 'lead-judge', 'field-manager']),
  cvFormsRouter
);

router.use('/:divisionId/export', roleValidator('tournament-manager'), exportRouter);

router.use(
  '/:divisionId/insights',
  roleValidator(['head-referee', 'judge-advisor', 'lead-judge', 'tournament-manager']),
  insightsRouter
);

router.use(
  '/:divisionId/deliberations',
  roleValidator(['lead-judge', 'judge-advisor']),
  deliberationsRouter
);

export default router;
