import express, { Request, Response } from 'express';
import db from '../../../lib/database';
import { makePortalSeasonResponse } from './util';

const router = express.Router({ mergeParams: true });

router.get('/latest', async (req: Request, res: Response) => {
  const currentSeason = await db.seasons.getCurrent();
  if (currentSeason) {
    res.status(200).json(makePortalSeasonResponse(currentSeason));
    return;
  }

  const latestSeason = await db.seasons.getAll()[0];
  res.status(200).json(makePortalSeasonResponse(latestSeason));
});

router.get('/:seasonSlug', async (req: Request, res: Response) => {
  const { seasonSlug } = req.params;
  const season = await db.seasons.bySlug(seasonSlug).get();
  if (season) {
    res.status(200).json(makePortalSeasonResponse(season));
    return;
  }

  res.status(404).json({ message: 'Season not found' });
});

router.get('/', async (req: Request, res: Response) => {
  const seasons = await db.seasons.getAll();
  res.status(200).json(seasons.map(makePortalSeasonResponse));
});

export default router;
