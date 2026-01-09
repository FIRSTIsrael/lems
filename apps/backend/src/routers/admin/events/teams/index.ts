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

    // TODO: Split DB operations into another function
    //  console.error('Error registering teams from CSV:', error);
    //  res.status(500).json({ error: 'Failed to register teams from CSV' });
  }
);

export default router;
