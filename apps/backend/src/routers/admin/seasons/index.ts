import express from 'express';
import fileUpload from 'express-fileupload';
import db from '../../../lib/database';
import { requirePermission } from '../middleware/require-permission';
import { AdminRequest } from '../../../types/express';
import { makeAdminSeasonResponse } from './util';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  requirePermission('MANAGE_SEASONS'),
  fileUpload(),
  async (req: AdminRequest, res) => {
    const { slug, name, startDate, endDate } = req.body;

    if (!slug || !name || !startDate || !endDate) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Create the season first
    let season = await db.seasons.create({
      slug,
      name,
      start_date: startDate,
      end_date: endDate,
      logo_url: null
    });

    if (req.files && req.files.logo) {
      const logoFile = req.files.logo as fileUpload.UploadedFile;

      if (!logoFile.mimetype?.startsWith('image/svg') || !logoFile.name.endsWith('.svg')) {
        res.status(400).json({ error: 'Logo must be an SVG file' });
        return;
      }

      try {
        const updatedSeason = await db.seasons.byId(season.id).updateLogo(logoFile.data);
        if (updatedSeason) {
          season = updatedSeason;
        }
      } catch (error) {
        console.error('Error uploading logo:', error);
        res.status(500).json({ error: 'Failed to upload logo' });
        return;
      }
    }

    res.status(201).json(makeAdminSeasonResponse(season));
  }
);

router.get('/', async (req: AdminRequest, res) => {
  const seasons = await db.seasons.getAll();
  res.status(200).json(seasons.map(makeAdminSeasonResponse));
});

router.get('/current', async (req: AdminRequest, res) => {
  const currentSeason = await db.seasons.getCurrent();
  if (!currentSeason) {
    res.status(404).json({ error: 'No current season found' });
    return;
  }
  res.status(200).json(makeAdminSeasonResponse(currentSeason));
});

router.get('/id/:id', async (req: AdminRequest, res) => {
  const { id } = req.params;
  const season = await db.seasons.byId(id).get();
  if (!season) {
    res.status(404).json({ error: 'Season not found' });
    return;
  }
  res.status(200).json(makeAdminSeasonResponse(season));
});

router.get('/:slug', async (req: AdminRequest, res) => {
  const { slug } = req.params;
  const season = await db.seasons.bySlug(slug).get();

  if (!season) {
    res.status(404).json({ error: 'Season not found' });
    return;
  }

  res.status(200).json(makeAdminSeasonResponse(season));
});

export default router;
