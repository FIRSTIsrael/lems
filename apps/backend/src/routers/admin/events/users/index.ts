import express from 'express';
import db from '../../../../lib/database';
import { AdminEventRequest } from '../../../../types/express';
import { makeAdminUserResponse } from '../../users/util';
import { requirePermission } from '../../../../middlewares/admin/require-permission';

const router = express.Router({ mergeParams: true });

router.get('/admins', async (req: AdminEventRequest, res) => {
  const admins = await db.admins.byEventId(req.eventId).getAll();
  res.json(admins.map(admin => makeAdminUserResponse(admin)));
});

router.post(
  '/admins',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminEventRequest, res) => {
    const { adminIds } = req.body;
    adminIds.forEach(async id => await db.events.byId(req.eventId).addAdmin(id));
    res.status(204).end();
  }
);

router.delete(
  '/admins/:adminId',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminEventRequest, res) => {
    await db.events.byId(req.eventId).removeAdmin(req.params.adminId);
    res.status(204).end();
  }
);

export default router;
