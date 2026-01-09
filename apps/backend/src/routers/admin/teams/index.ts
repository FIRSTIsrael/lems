import express from 'express';
import fileUpload, { UploadedFile } from 'express-fileupload';
import { ensureArray } from '@lems/shared/utils';
import db from '../../../lib/database';
import { AdminRequest } from '../../../types/express';
import { requirePermission } from '../middleware/require-permission';
import { makeAdminTeamResponse, parseTeamList } from './util';

const router = express.Router({ mergeParams: true });
const FILE_SIZE_LIMIT = 2 * 1024 * 1024; // 2 MB

router.get('/', async (req: AdminRequest, res) => {
  let teams = await db.teams.getAllWithActiveStatus();

  const extraFields = ensureArray(req.query.extraFields).map(field => field.toLowerCase());

  if (extraFields.includes('deletable')) {
    const unregistered = await db.teams.getAllUnregistered();
    const unregisteredIds = new Set(unregistered.map(t => t.id));

    teams = teams.map(team => {
      return {
        ...team,
        deletable: unregisteredIds.has(team.id)
      };
    });
  }

  const response = teams.map(team => makeAdminTeamResponse(team));
  res.json(response);
});

router.delete('/:teamId', requirePermission('MANAGE_TEAMS'), async (req: AdminRequest, res) => {
  const teamId = req.params.teamId;

  const team = await db.teams.byId(teamId).get();
  if (!team) {
    res.status(404).json({ error: 'Team not found' });
    return;
  }

  const teamEvents = await db.events.byTeam(team.id).getAll();

  if (teamEvents.length > 0) {
    res.status(400).json({ error: 'Cannot delete team that is registered for an event' });
    return;
  }

  const success = await db.teams.byId(teamId).delete();
  if (!success) {
    res.status(500).json({ error: 'Could not delete team' });
    return;
  }

  res.status(200).end();
});

router.get('/:teamId', async (req: AdminRequest, res) => {
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
        if (
          logoFile.size > FILE_SIZE_LIMIT
        ) {
          res.status(400).json({ error: 'Logo file size must not exceed 2 MB' });
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
    const { name, number, affiliation, city, region } = req.body;

    if (!name || !number || !affiliation || !city || !region) {
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
        region: region.toUpperCase(),
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
        if (
          logoFile.size > FILE_SIZE_LIMIT
        ) {
          res.status(400).json({ error: 'Logo file size must not exceed 2 MB' });
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

export default router;
