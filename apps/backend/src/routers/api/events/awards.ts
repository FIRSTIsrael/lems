import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getEventAwards(new ObjectId(req.params.eventId)).then(awards => {
    res.json(awards);
  });
});

router.get('/:awardId', (req: Request, res: Response) => {
  db.getAward({
    _id: new ObjectId(req.params.roomId),
    event: new ObjectId(req.params.eventId)
  }).then(award => {
    res.json(award);
  });
});

export default router;
