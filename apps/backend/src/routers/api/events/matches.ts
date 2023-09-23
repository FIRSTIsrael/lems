import express, { Request, Response } from 'express';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  res.json(await db.getEventMatches(req.params.eventId));
});

export default router;
