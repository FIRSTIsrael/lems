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

export default router;
