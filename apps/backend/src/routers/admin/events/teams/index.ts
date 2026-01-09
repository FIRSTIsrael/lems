import express from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { parse } from 'csv-parse/sync';
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

    try {
      const records = parse(csvFile.data, {
        columns: false,
        skip_empty_lines: true
      }) as string[][];

      const teamNumbers = records
        .map(row => {
          const number = parseInt(row[0]?.trim(), 10);
          return isNaN(number) ? null : number;
        })
        .filter((num): num is number => num !== null);

      if (teamNumbers.length === 0) {
        res.status(400).json({ error: 'No valid team numbers found in CSV' });
        return;
      }

      const divisions = await db.events.byId(req.eventId).getDivisions();
      const availableDivisions = divisions.filter(d => !d.has_schedule);

      if (availableDivisions.length === 0) {
        res.status(400).json({ error: 'No available divisions for team registration' });
        return;
      }

      // Validate division if not random
      let selectedDivisions = availableDivisions;
      if (divisionId !== 'random') {
        const division = divisions.find(d => d.id === divisionId);
        if (!division) {
          res.status(400).json({ error: 'Division not found' });
          return;
        }
        if (division.has_schedule) {
          res.status(400).json({ error: 'Cannot register teams to division with schedule' });
          return;
        }
        selectedDivisions = [division];
      }

      const registered: Array<{ name: string; number: number; division: { name: string; color: string } }> = [];
      const skipped: Array<{ name: string; number: number; reason: string }> = [];
      const allTeams = await db.teams.getAll();
      const teamsByNumber = new Map(allTeams.map(t => [t.number, t]));

      for (let i = 0; i < teamNumbers.length; i++) {
        const teamNumber = teamNumbers[i];
        const team = teamsByNumber.get(teamNumber);

        if (!team) {
          skipped.push({
            name: `Unknown`,
            number: teamNumber,
            reason: 'Team not found'
          });
          continue;
        }

        const registeredTeams = await db.events.byId(req.eventId).getRegisteredTeams();
        const alreadyRegistered = registeredTeams.find(rt => rt.id === team.id);

        if (alreadyRegistered) {
          skipped.push({
            name: team.name,
            number: team.number,
            reason: 'Already registered to this event'
          });
          continue;
        }

        const assignedDivision =
          divisionId === 'random'
            ? selectedDivisions[i % selectedDivisions.length]
            : selectedDivisions[0];

        const registration: Record<string, string[]> = {
          [assignedDivision.id]: [team.id]
        };

        try {
          await db.events.byId(req.eventId).registerTeams(registration);
          registered.push({
            name: team.name,
            number: team.number,
            division: {
              name: assignedDivision.name,
              color: assignedDivision.color
            }
          });
        } catch (error) {
          console.error(`Error registering team ${team.number}:`, error);
          skipped.push({
            name: team.name,
            number: team.number,
            reason: 'Failed to register'
          });
        }
      }

      res.status(200).json({
        registered,
        skipped
      });
    } catch (error) {
      console.error('Error registering teams from CSV:', error);
      res.status(500).json({ error: 'Failed to register teams from CSV' });
    }
  }
);

export default router;
