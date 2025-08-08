import express from 'express';
import fileUpload from 'express-fileupload';
import db from '../../../lib/database';
import { AdminRequest } from '../../../types/express';
import { makeAdminTeamResponse } from './util';

const router = express.Router({ mergeParams: true });

router.post('/', fileUpload(), async (req: AdminRequest, res) => {
  const { name, number, affiliationName, affiliationCity } = req.body;

  if (!name || !number || !affiliationName || !affiliationCity) {
    res.status(400).json({ error: 'All fields are required' });
    return;
  }

  const teamNumber = parseInt(number);
  if (isNaN(teamNumber)) {
    res.status(400).json({ error: 'Team number must be a valid number' });
    return;
  }

  try {
    const affiliation = await db.teamAffiliations.create({
      name: affiliationName,
      city: affiliationCity,
      coordinates: null //TODO: Add support for coordinates on team creation
    });

    let team = await db.teams.create({
      name,
      number: teamNumber,
      affiliation_id: affiliation.id,
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
        const updatedTeam = await db.teams.byId(team.id).updateLogo(logoFile.data);
        if (updatedTeam) {
          team = updatedTeam;
        }
      } catch (error) {
        console.error('Error uploading team logo:', error);
        res.status(500).json({ error: 'Failed to upload team logo' });
        return;
      }
    }

    // Get the team with affiliation for response
    const teamWithAffiliation = await db.teams.byId(team.id).get();
    if (!teamWithAffiliation) {
      res.status(500).json({ error: 'Failed to retrieve created team' });
      return;
    }

    res.status(201).json(makeAdminTeamResponse(teamWithAffiliation));
  } catch (error) {
    console.error('Error creating team:', error);
    if (error instanceof Error && error.message.includes('unique')) {
      res.status(400).json({ error: 'Team number already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create team' });
    }
  }
});

router.get('/', async (req: AdminRequest, res) => {
  const teams = await db.teams.getAll();
  res.json(teams.map(team => makeAdminTeamResponse(team)));
});

export default router;
