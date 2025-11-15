import express from 'express';
import db from '../../../../lib/database';
import { AdminEventRequest } from '../../../../types/express';
import { makeAdminUserResponse } from '../../users/util';
import { requirePermission } from '../../middleware/require-permission';
import {
  makeAdminVolunteerResponse,
  generateVolunteerPassword,
  getRoleInfoMapping,
  formatVolunteerInfo
} from './util';

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
    const { adminId } = req.params;
    if (adminId === req.userId) {
      res.status(400).json({ error: 'CANNOT_REMOVE_SELF' });
      return;
    }
    await db.events.byId(req.eventId).removeAdmin(adminId);
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
      if (volunteer.role === 'judge' || volunteer.role === 'referee') {
        // Judge and referee are managed by the system
        continue;
      }

      await db.eventUsers.delete(volunteer.id);
    }

    const volunteersToCreate = volunteers.map(volunteer => ({
      event_id: req.eventId,
      role: volunteer.role,
      identifier: volunteer.identifier || null,
      role_info: volunteer.roleInfo || null,
      password: generateVolunteerPassword()
    }));

    const createdVolunteers = await db.eventUsers.createMany(volunteersToCreate);

    for (let i = 0; i < createdVolunteers.length; i++) {
      const volunteer = createdVolunteers[i];
      const originalData = volunteers[i];

      if (originalData.divisions && originalData.divisions.length > 0) {
        await db.eventUsers.assignUserToDivisions(volunteer.id, originalData.divisions);
      }
    }

    const allDivisions = await db.divisions.byEventId(req.eventId).getAll();
    const volunteersWithDivisions = await db.eventUsers.byEventId(req.eventId).getAll();

    const divisionsWithUsers = new Set<string>();
    volunteersWithDivisions.forEach(volunteer => {
      volunteer.divisions.forEach(divisionId => divisionsWithUsers.add(divisionId));
    });

    for (const division of allDivisions) {
      const hasUsers = divisionsWithUsers.has(division.id);
      await db.divisions.byId(division.id).update({ has_users: hasUsers });
    }

    const finalVolunteersWithDivisions = await db.eventUsers.byEventId(req.eventId).getAll();
    res
      .status(201)
      .json(finalVolunteersWithDivisions.map(volunteer => makeAdminVolunteerResponse(volunteer)));
  }
);

router.get(
  '/volunteers/passwords',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminEventRequest, res) => {
    const volunteers = await db.eventUsers.byEventId(req.eventId).getAll();
    const divisions = await db.divisions.byEventId(req.eventId).getAll();

    const roleInfoMapping = await getRoleInfoMapping(divisions);

    const csvLines = ['Role,Divisions,Identifier,Role Info,Password'];

    volunteers.forEach(volunteer => {
      csvLines.push(formatVolunteerInfo(volunteer, roleInfoMapping));
    });

    // Add UTF-8 BOM
    const BOM = '\ufeff';
    const csvContent = BOM + csvLines.join('\n');

    res.setHeader(
      'Content-Disposition',
      `attachment; filename="volunteer_passwords_${req.eventId}.csv"`
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.send(csvContent);
  }
);

export default router;
