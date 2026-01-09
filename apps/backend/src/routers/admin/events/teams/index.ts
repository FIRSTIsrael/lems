import express from 'express';
import db from '../../../../lib/database';
import { requirePermission } from '../../middleware/require-permission';
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
  '/remove',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminEventRequest, res) => {
    const teamsToRemove = req.body;

    if (!teamsToRemove || !Array.isArray(teamsToRemove)) {
      res.status(400).json({ error: 'Invalid team removal data' });
      return;
    }

    await db.events.byId(req.eventId).removeTeams(teamsToRemove);

    res.status(200).end();
  }
);

router.put(
  '/:teamId/division',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminEventRequest, res) => {
    const { teamId } = req.params;
    const { divisionId } = req.body;

    if (!teamId || !divisionId) {
      res.status(400).json({ error: 'Team ID and division ID are required' });
      return;
    }

    try {
      await db.events.byId(req.eventId).changeTeamDivision(teamId, divisionId);
      res.status(200).end();
    } catch (error) {
      console.error('Error changing team division:', error);
      res.status(500).json({ error: 'Failed to change team division' });
    }
  }
);

export default router;
