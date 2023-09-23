import express, { Request, Response } from 'express';
import * as db from '@lems/database';
import { ObjectId } from 'mongodb';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  res.json(await db.getEventMatches(req.params.eventId));
});

router.get('/:matchId', async (req: Request, res: Response) => {
  res.json(
    await db.getMatch({
      _id: new ObjectId(req.params.matchId)
    })
  );
});

export default router;
