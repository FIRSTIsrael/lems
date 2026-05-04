import express from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import db from '../../../../lib/database';
import { requirePermission } from '../../middleware/require-permission';
import { AdminEventRequest } from '../../../../types/express';
import { makeAdminTeamResponse, makeAdminTeamWithDivisionResponse } from '../../teams/util';
import { isTeamsRegistration, parseTeamCSVRegistration } from './utils';

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

    if (!teamId || typeof teamId !== 'string') {
      res.status(400).json({ error: 'Team ID is required' });
      return;
    }

    if (!divisionId) {
      res.status(400).json({ error: 'Division ID is required' });
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

router.post(
  '/register-from-csv',
  [requirePermission('MANAGE_EVENT_DETAILS'), fileUpload()],
  async (req: AdminEventRequest, res) => {
    if (!req.files || !req.files.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const csvFile = req.files.file as UploadedFile;
    const divisionId = req.body.divisionId as string;

    if (!divisionId) {
      res.status(400).json({ error: 'Division ID is required' });
      return;
    }

    if (!csvFile.name.endsWith('.csv')) {
      res.status(400).json({ error: 'File must be a CSV' });
      return;
    }

    const divisions = await db.events.byId(req.eventId).getDivisions();
    const availableDivisions = divisions.filter(d => !d.has_schedule);

    if (availableDivisions.length === 0) {
      res.status(400).json({ error: 'No available divisions for team registration' });
      return;
    }

    let selectedDivisions = availableDivisions;
    if (divisionId !== 'random') {
      const division = divisions.find(d => d.id === divisionId);
      if (!division) {
        res.status(404).json({ error: 'Division not found' });
        return;
      }

      if (division.has_schedule) {
        res.status(400).json({ error: 'Cannot register teams to division with schedule' });
        return;
      }

      selectedDivisions = [division];
    }

    try {
      // TODO: Split DB operations into another function
      const { registered, skipped } = await parseTeamCSVRegistration(
        csvFile,
        selectedDivisions,
        req.eventId,
        divisionId === 'random'
      );

      res.status(200).json({
        registered,
        skipped
      });
    } catch (error) {
      res.status(400).json({ error: String(error) });
      return;
    }
  }
);

router.get('/registrations', async (req: AdminEventRequest, res) => {
  const teamIds = req.query.teamIds;

  if (!teamIds || typeof teamIds !== 'string') {
    res.status(400).json({ error: 'Team IDs required' });
    return;
  }

  const ids = teamIds.split(',');
  if (ids.length === 0 || ids.length > 100) {
    res.status(400).json({ error: 'Invalid number of team IDs' });
    return;
  }

  try {
    const event = await db.events.byId(req.eventId).get();
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const registrations: Record<
      string,
      Array<{ id: string; name: string; slug: string; date: string }>
    > = {};

    for (const teamId of ids) {
      const events = await db.events.byTeam(teamId).getAllSummaries();
      // Filter by current season
      registrations[teamId] = events
        .filter(e => e.season_id === event.season_id)
        .map(e => ({
          id: e.id,
          name: e.name,
          slug: e.slug,
          date: e.date
        }));
    }

    res.json(registrations);
  } catch (error) {
    console.error('Error fetching team registrations:', error);
    res.status(500).json({ error: 'Failed to fetch team registrations' });
  }
});

router.post(
  '/swap-teams',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminEventRequest, res) => {
    res.status(501).json({ error: 'Not implemented' });
  }
);

router.post(
  '/replace-team',
  requirePermission('MANAGE_EVENT_DETAILS'),
  async (req: AdminEventRequest, res) => {
    res.status(501).json({ error: 'Not implemented' });
  }
);

export default router;
