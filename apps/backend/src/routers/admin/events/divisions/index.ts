import express from 'express';
import db from '../../../../lib/database';
import { AdminRequest } from '../../../../types/express';
import { makeAdminDivisionResponse } from './util';

const router = express.Router({ mergeParams: true });

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
