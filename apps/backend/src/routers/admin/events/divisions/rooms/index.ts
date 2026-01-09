import express from 'express';
import db from '../../../../../lib/database';
import { requirePermission } from '../../../middleware/require-permission';
import { AdminDivisionRequest } from '../../../../../types/express';
import { generateVolunteerPassword } from '../../users/util';

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

    const room = await db.rooms.create({ division_id: req.divisionId, name });
    const division = await db.divisions.byId(req.divisionId).get();

    const eventUser = await db.eventUsers.create({
      event_id: division.event_id,
      role: 'judge',
      role_info: { roomId: room.id },
      identifier: null,
      password: generateVolunteerPassword()
    });

    await db.eventUsers.assignUserToDivisions(eventUser.id, [req.divisionId]);

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

router.delete(
  '/:roomId',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminDivisionRequest, res) => {
    const { roomId } = req.params;
    await db.rooms.byId(roomId).delete();

    const roomEventUser = await db.eventUsers.byRoleInfo('roomId', roomId).get();

    if (roomEventUser) {
      await db.eventUsers.delete(roomEventUser.id);
    }

    res.status(204).end();
  }
);

export default router;
