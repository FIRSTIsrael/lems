import express from 'express';
import db from '../../../../lib/database';
import { AdminRequest } from '../../../../types/express';
import { requirePermission } from '../../../../middlewares/admin/require-permission';
import { makeAdminDivisionResponse } from '../../divisions/util';

const router = express.Router({ mergeParams: true });

router.post('/', requirePermission('MANAGE_EVENT_DETAILS'), async (req, res) => {
  const event = await db.events.bySlug(req.params.slug).get();

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const { name, color } = req.body;

  if (!name || !color) {
    res.status(400).json({ error: 'Name and color are required' });
    return;
  }

  const division = await db.divisions.create({ name, color, event_id: event.id });

  res.status(201).json(makeAdminDivisionResponse(division));
});

router.get('/', async (req: AdminRequest, res) => {
  const event = await db.events.bySlug(req.params.slug).get();

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const divisions = await db.divisions.byEventId(event.id).getAll();
  res.json(divisions.map(division => makeAdminDivisionResponse(division)));
});

export default router;
