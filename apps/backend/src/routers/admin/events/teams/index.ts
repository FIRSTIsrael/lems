import express from 'express';
import db from '../../../../lib/database';
import { requirePermission } from '../../../../middlewares/admin/require-permission';
import { AdminRequest } from '../../../../types/express';
import { makeAdminTeamResponse, makeAdminTeamWithDivisionResponse } from '../../teams/util';
import { isTeamsRegistration } from './utils';

const router = express.Router({ mergeParams: true });

router.post(
  '/register',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminRequest, res) => {
    const registration = req.body;

    if (!registration || !isTeamsRegistration(registration)) {
      res.status(400).json({ error: 'Invalid teams registration data' });
      return;
    }
    const event = await db.events.bySlug(req.params.slug).get();
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    await db.divisions.byEventId(event.id).registerTeams(registration);

    res.status(200).json({ success: true });
  }
);

router.get('/', async (req: AdminRequest, res) => {
  const event = await db.events.bySlug(req.params.slug).get();

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const teams = await db.events.byId(event.id).getRegisteredTeams();

  res.json(teams.map(team => makeAdminTeamWithDivisionResponse(team)));
});

router.get('/available', async (req: AdminRequest, res) => {
  const event = await db.events.bySlug(req.params.slug).get();

  if (!event) {
    res.status(404).json({ error: 'Event not found' });
    return;
  }

  const teams = await db.events.byId(event.id).getAvailableTeams();

  res.json(teams.map(team => makeAdminTeamResponse(team)));
});

export default router;
