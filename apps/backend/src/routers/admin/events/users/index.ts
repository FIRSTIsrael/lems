import express from 'express';
import db from '../../../../lib/database';
import { AdminEventRequest } from '../../../../types/express';
import { makeAdminUserResponse, makeAdminVolunteerResponse } from '../../users/util';
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

router.get('/volunteers', async (req: AdminEventRequest, res) => {
  const volunteers = await db.eventUsers.byEventId(req.eventId).getAll();
  res.json(volunteers.map(volunteer => makeAdminVolunteerResponse(volunteer)));
});

router.post(
  '/volunteers',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminEventRequest, res) => {
    const { volunteers } = req.body;

    if (!Array.isArray(volunteers) || volunteers.length === 0) {
      res.status(400).json({ error: 'Volunteers array is required' });
      return;
    }

    const existingVolunteers = await db.eventUsers.byEventId(req.eventId).getAll();
    for (const volunteer of existingVolunteers) {
      await db.eventUsers.delete(volunteer.id);
    }

    const volunteersToCreate = volunteers.map(volunteer => ({
      event_id: req.eventId,
      role: volunteer.role,
      identifier: volunteer.identifier || null,
      role_info: volunteer.roleInfo || null,
      password: Math.random().toString(36).slice(-4).toUpperCase() // Generate 4-char password
    }));

    const createdVolunteers = await db.eventUsers.createMany(volunteersToCreate);

    for (let i = 0; i < createdVolunteers.length; i++) {
      const volunteer = createdVolunteers[i];
      const originalData = volunteers[i];

      if (originalData.divisions && originalData.divisions.length > 0) {
        await db.eventUsers.assignUserToDivisions(volunteer.id, originalData.divisions);
      }
    }

    const volunteersWithDivisions = await db.eventUsers.byEventId(req.eventId).getAll();
    res
      .status(201)
      .json(volunteersWithDivisions.map(volunteer => makeAdminVolunteerResponse(volunteer)));
  }
);

export default router;
