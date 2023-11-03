import express, { Request, Response } from 'express';
import { WithId, ObjectId } from 'mongodb';
import { Award } from '@lems/types';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getEventAwards(new ObjectId(req.params.eventId)).then(awards => {
    res.json(awards);
  });
});

router.get('/:awardId', (req: Request, res: Response) => {
  db.getAward({
    _id: new ObjectId(req.params.awardId),
    eventId: new ObjectId(req.params.eventId)
  }).then(award => {
    res.json(award);
  });
});

router.put('/winners', async (req: Request, res: Response) => {
  const newAwards: Array<WithId<Award>> = req.body;

  newAwards.forEach(award => {
    award._id = new ObjectId(award._id);
    if (typeof award.winner === 'string' || !award.winner) return;
    award.winner._id = new ObjectId(award.winner?._id);
    award.winner.eventId = new ObjectId(award.winner?.eventId);
  });

  await Promise.all(
    newAwards.map(async (award: WithId<Award>) => {
      if (!(await db.updateAward({ _id: award._id }, { winner: award.winner })).acknowledged)
        return res.status(500).json({ ok: false });
    })
  );

  res.json({ ok: true });
});

export default router;
