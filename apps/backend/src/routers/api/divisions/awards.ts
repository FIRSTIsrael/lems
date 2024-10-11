import express, { Request, Response } from 'express';
import { WithId, ObjectId } from 'mongodb';
import * as db from '@lems/database';
import asyncHandler from 'express-async-handler';
import { Award, Team, AwardNames } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  db.getDivisionAwards(new ObjectId(req.params.divisionId)).then(awards => {
    res.json(awards);
  });
});

router.get('/:awardId', (req: Request, res: Response) => {
  db.getAward({
    _id: new ObjectId(req.params.awardId),
    divisionId: new ObjectId(req.params.divisionId)
  }).then(award => {
    res.json(award);
  });
});

router.put(
  '/:awardName/winners',
  asyncHandler(async (req: Request, res: Response) => {
    const awardName: AwardNames = req.params.awardName as AwardNames;
    let awards = await db.getDivisionAwards(new ObjectId(req.params.divisionId));
    awards = awards.filter(a => a.name === awardName);
    if (awards.length === 0) {
      res.status(400).json({ error: 'Invalid award name' });
      return;
    }

    const winners: Array<WithId<Team> | string> = req.body;
    const newAwards = awards
      .sort((a, b) => a.place - b.place)
      .map((award, index) => ({ ...award, winner: winners[index] }));

    await Promise.all(
      newAwards.map(async (award: WithId<Award>) => {
        if (!(await db.updateAward({ _id: award._id }, { winner: award.winner })).acknowledged)
          return res.status(500).json({ ok: false });
      })
    );

    res.json({ ok: true });
  })
);

export default router;
