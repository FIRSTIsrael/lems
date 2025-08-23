import express from 'express';
import db from '../../../lib/database';
import { AdminRequest } from '../../../types/express';
import { requirePermission } from '../../../middlewares/admin/require-permission';
import divisionRoomsRouter from './rooms/index';
import divisionTablesRouter from './tables/index';
import divisionPitMapRouter from './pit-map/index';

const router = express.Router({ mergeParams: true });

router.use('/:id/rooms', divisionRoomsRouter);
router.use('/:id/tables', divisionTablesRouter);
router.use('/:id/pit-map', divisionPitMapRouter);

router.put('/:id', requirePermission('MANAGE_EVENT_DETAILS'), async (req: AdminRequest, res) => {
  const { id } = req.params;
  const { name, color } = req.body;

  // Name can be empty, but has to exist
  if (name === null || name === undefined || !color) {
    res.status(400).json({ error: 'Name and color are required' });
    return;
  }

  const division = await db.divisions.byId(id).update({ name, color });

  if (!division) {
    res.status(404).json({ error: 'Division not found' });
    return;
  }

  res.status(200).json({ success: true });
});

export default router;
