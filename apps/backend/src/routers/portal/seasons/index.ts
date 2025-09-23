import express, { Request, Response } from 'express';
import db from '../../../lib/database';
import { makePortalSeasonResponse } from './utils';

const router = express.Router({ mergeParams: true });

router.get('/current', async (req: Request, res: Response) => {
  const currentSeason = await db.seasons.getCurrent();
  if (!currentSeason) {
    res.status(404).json({ error: 'No current season found' });
    return;
  }
  res.status(200).json(makePortalSeasonResponse(currentSeason));
});

export default router;
