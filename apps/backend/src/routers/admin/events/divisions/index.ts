import express from 'express';
import db from '../../../../lib/database';
import { AdminDivisionRequest, AdminEventRequest } from '../../../../types/express';
import { attachDivision } from '../../middleware/attach-division';
import { requirePermission } from '../../middleware/require-permission';
import { makeAdminDivisionResponse } from './util';
import divisionRoomsRouter from './rooms';
import divisionTablesRouter from './tables';
import divisionPitMapRouter from './pit-map';
import divisionTeamsRouter from './teams';
import divisionScheduleRouter from './schedule';
import divisionAwardsRouter from './awards';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: AdminEventRequest, res) => {
  const divisions = await db.divisions.byEventId(req.eventId).getAll();
  res.json(divisions.map(division => makeAdminDivisionResponse(division)));
});

router.post('/', requirePermission('MANAGE_EVENT_DETAILS'), async (req: AdminEventRequest, res) => {
  const { name, color } = req.body;

  if (!name || !color) {
    res.status(400).json({ error: 'Name and color are required' });
    return;
  }

  const division = await db.divisions.create({ name, color, event_id: req.eventId });

  res.status(201).json(makeAdminDivisionResponse(division));
});

router.use('/:divisionId', attachDivision());

router.use('/:divisionId/rooms', divisionRoomsRouter);
router.use('/:divisionId/tables', divisionTablesRouter);
router.use('/:divisionId/pit-map', divisionPitMapRouter);
router.use('/:divisionId/teams', divisionTeamsRouter);
router.use('/:divisionId/awards', divisionAwardsRouter);
router.use('/:divisionId/schedule', divisionScheduleRouter);

router.put(
  '/:divisionId',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    const { name, color } = req.body;

    // Name can be empty, but has to exist
    if (name === null || name === undefined || !color) {
      res.status(400).json({ error: 'Name and color are required' });
      return;
    }

    await db.divisions.byId(req.divisionId).update({ name, color });

    res.status(200).end();
  }
);

router.delete(
  '/:divisionId',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    const deleted = await db.divisions.byId(req.divisionId).delete();

    if (!deleted) {
      res.status(404).json({ error: 'Division not found' });
      return;
    }

    res.status(204).end();
  }
);

export default router;
