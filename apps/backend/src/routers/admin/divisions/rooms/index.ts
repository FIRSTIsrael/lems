import express from 'express';
import db from '../../../../lib/database';
import { requirePermission } from '../../../../middlewares/admin/require-permission';

const router = express.Router({ mergeParams: true });

router.post('/', requirePermission('MANAGE_EVENT_DETAILS'), async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }

  await db.divisions.byId(id).createRoom({ name });

  res.status(201).json({});
});

router.get('/', async (req, res) => {
  const { id } = req.params as { id: string };

  const rooms = await db.divisions.byId(id).getRooms();
  res.status(200).json(rooms);
});

export default router;
