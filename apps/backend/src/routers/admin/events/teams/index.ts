import express from 'express';
import db from '../../../../lib/database';
import { requirePermission } from '../../../../middlewares/admin/require-permission';
import { AdminEventRequest } from '../../../../types/express';
import { makeAdminTeamResponse, makeAdminTeamWithDivisionResponse } from '../../teams/util';
import { isTeamsRegistration } from './utils';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: AdminEventRequest, res) => {
  const teams = await db.events.byId(req.eventId).getRegisteredTeams();
  res.json(teams.map(team => makeAdminTeamWithDivisionResponse(team)));
});

router.get('/available', async (req: AdminEventRequest, res) => {
  const teams = await db.events.byId(req.eventId).getAvailableTeams();
  res.json(teams.map(team => makeAdminTeamResponse(team)));
});

router.post(
  '/register',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminEventRequest, res) => {
    const registration = req.body;

    if (!registration || !isTeamsRegistration(registration)) {
      res.status(400).json({ error: 'Invalid teams registration data' });
      return;
    }

    await db.events.byId(req.eventId).registerTeams(registration);

    res.status(200).end();
  }
);

router.delete(
  '/unregister',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminEventRequest, res) => {
    const unregisterationData = req.body;

    if (!unregisterationData || !Array.isArray(unregisterationData)) {
      res.status(400).json({ error: 'Invalid teams unregistration data' });
      return;
    }

    await db.events.byId(req.eventId).unregisterTeams(unregisterationData);

    res.status(200).end();
  }
);

export default router;
