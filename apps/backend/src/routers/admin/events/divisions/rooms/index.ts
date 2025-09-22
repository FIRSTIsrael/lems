import express from 'express';
import db from '../../../../../lib/database';
import { requirePermission } from '../../../../../middlewares/admin/require-permission';
import { AdminDivisionRequest } from '../../../../../types/express';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: AdminDivisionRequest, res) => {
  const rooms = await db.rooms.byDivisionId(req.divisionId).getAll();
  res.status(200).json(rooms);
});

router.post(
  '/',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    await db.rooms.create({ division_id: req.divisionId, name });

    res.status(201).end();
  }
);

router.put(
  '/:roomId',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    const { roomId } = req.params;
    const { name } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    await db.rooms.byId(roomId).update({ name });

    res.status(200).end();
  }
);

export default router;
