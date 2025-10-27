import express from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { UpdateableTeam } from '@lems/database';
import db from '../../../lib/database';
import { AdminRequest } from '../../../types/express';
import { requirePermission } from '../../../middlewares/admin/require-permission';
import { makeAdminTeamResponse, parseTeamList } from './util';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: AdminRequest, res) => {
  const teams = await db.teams.getAllWithActiveStatus();
  if (!req.query.extraFields) {
    const response = teams.map(team => makeAdminTeamResponse(team));
    res.json(response);
    return;
  }
  if (req.query.extraFields == 'deletable') {
    const teamDivisions = await db.teams.getAllTeamDivisions();
    const teamIdsInDivisions = new Set(teamDivisions.map(td => td.team_id));

    const response = teams.map(team => {
      const baseResponse = makeAdminTeamResponse(team);
      return {
        ...baseResponse,
        deletable: !teamIdsInDivisions.has(team.id)
      };
    });

    res.json(response);
  } else {
    res.status(400).json({ error: 'Invalid extraFields query' });
  }
});

router.get('/:number', async (req: AdminRequest, res) => {
  const number = Number(req.params.number);
  if (Number.isNaN(number)) {
    res.status(400).json({ error: 'Invalid team number' });
    return;
  }

  const team = await db.teams.byNumber(number).get();
  if (!team) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }
  res.json(makeAdminTeamResponse(team));
});

router.delete('/:id', requirePermission('MANAGE_TEAMS'), async (req: AdminRequest, res) => {
  const id = req.params.id;

  const team = await db.teams.byId(id).get();
  if (!team) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }

  const teamEvents = await db.events.byTeam(team.id).getAll();

  if (teamEvents.length > 0) {
    res.status(400).json({ error: 'Cannot delete team that is registered for an event' });
    return;
  }

  const success = await db.teams.byId(id).delete();
  if (!success) {
    res.status(500).json({ error: 'Could not delete team' });
    return;
  }

  res.status(200).end();
});

router.get('/id/:teamId', async (req: AdminRequest, res) => {
  const id = req.params.teamId;
  const team = await db.teams.byId(id).get();
  if (!team) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }
  res.json(makeAdminTeamResponse(team));
});

router.put(
  '/:teamId',
  requirePermission('MANAGE_TEAMS'),
  fileUpload(),
  async (req: AdminRequest, res) => {
    const { name, affiliation, city } = req.body;

    if (!name || !affiliation || !city) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const teamId = req.params.teamId;
    if (!teamId) {
      res.status(400).json({ error: 'Team ID must be provided' });
      return;
    }

    try {
      let team = await db.teams.byId(teamId).update({
        name,
        affiliation,
        city
      });

      if (req.files && req.files.logo) {
        const logoFile = req.files.logo as fileUpload.UploadedFile;

        if (
          !logoFile.mimetype?.startsWith('image/') ||
          (!logoFile.name.endsWith('.jpg') &&
            !logoFile.name.endsWith('.jpeg') &&
            !logoFile.name.endsWith('.png') &&
            !logoFile.name.endsWith('.svg'))
        ) {
          res.status(400).json({ error: 'Logo must be an image file (JPG, PNG, or SVG)' });
          return;
        }

        try {
          team = await db.teams.byId(team.id).updateLogo(logoFile.data);
        } catch (error) {
          console.error('Error uploading team logo:', error);
          res.status(500).json({ error: 'Failed to upload team logo' });
          return;
        }
      }

      if (!team) {
        res.status(500).json({ error: 'Failed to retrieve updated team' });
        return;
      }

      res.status(200).json(makeAdminTeamResponse(team));
    } catch (error) {
      console.error('Error updating team:', error);
      res.status(500).json({ error: 'Failed to update team' });
    }
  }
);

router.post(
  '/',
  requirePermission('MANAGE_TEAMS'),
  fileUpload(),
  async (req: AdminRequest, res) => {
    const { name, number, affiliation, city } = req.body;

    if (!name || !number || !affiliation || !city) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const teamNumber = parseInt(number);
    if (isNaN(teamNumber)) {
      res.status(400).json({ error: 'Team number must be a valid number' });
      return;
    }

    try {
      let team = await db.teams.create({
        name,
        number: teamNumber,
        affiliation,
        city,
        coordinates: null,
        logo_url: null
      });

      if (req.files && req.files.logo) {
        const logoFile = req.files.logo as fileUpload.UploadedFile;

        if (
          !logoFile.mimetype?.startsWith('image/') ||
          (!logoFile.name.endsWith('.jpg') &&
            !logoFile.name.endsWith('.jpeg') &&
            !logoFile.name.endsWith('.png') &&
            !logoFile.name.endsWith('.svg'))
        ) {
          res.status(400).json({ error: 'Logo must be an image file (JPG, PNG, or SVG)' });
          return;
        }

        try {
          team = await db.teams.byId(team.id).updateLogo(logoFile.data);
        } catch (error) {
          console.error('Error uploading team logo:', error);
          res.status(500).json({ error: 'Failed to upload team logo' });
          return;
        }
      }

      if (!team) {
        res.status(500).json({ error: 'Failed to retrieve created team' });
        return;
      }

      res.status(201).json(makeAdminTeamResponse(team));
    } catch (error) {
      console.error('Error creating team:', error);
      if (error instanceof Error && error.message.includes('unique')) {
        res.status(409).json({ error: 'Team number already exists' });
      } else {
        res.status(500).json({ error: 'Failed to create team' });
      }
    }
  }
);

router.post(
  '/import',
  [requirePermission('MANAGE_TEAMS'), fileUpload()],
  async (req: AdminRequest, res) => {
    if (!req.files || !req.files.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const importFile = req.files.file as UploadedFile;

    if (!importFile.name.endsWith('.csv')) {
      res.status(400).json({ error: 'File must be a CSV' });
      return;
    }

    try {
      const teams = await parseTeamList(importFile.data);
      const { created, updated } = await db.teams.upsertMany(teams);
      res.status(201).json({
        created: created.map(team => makeAdminTeamResponse(team)),
        updated: updated.map(team => makeAdminTeamResponse(team))
      });
    } catch (error) {
      console.error('Error importing teams:', error);
      res.status(500).json({ error: 'Failed to import teams' });
    }
  }
);

router.put('/:number', requirePermission('MANAGE_TEAMS'), async (req: AdminRequest, res) => {
  const number = Number(req.params.number);
  if (Number.isNaN(number)) {
    res.status(400).json({ error: 'Invalid team number' });
    return;
  }

  const team = await db.teams.byNumber(number).update(req.body as Partial<UpdateableTeam>);
  if (!team) {
    res.status(500).json({ error: 'Updating team failed' });
    return;
  }
  res.status(200).json(makeAdminTeamResponse(team));
});

router.delete('/:number', requirePermission('MANAGE_TEAMS'), async (req: AdminRequest, res) => {
  const number = Number(req.params.number);
  if (Number.isNaN(number)) {
    res.status(400).json({ error: 'Invalid team number' });
    return;
  }

  const success = await db.teams.byNumber(number).delete();
  if (!success) {
    res.status(500).json({ error: 'Could not delete team' });
    return;
  }
  res.status(200);
});

export default router;
