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

router.post('/', (req: Request, res: Response) => {
  const awards = req.body.map((award: Award) => ({
    ...award,
    divisionId: new ObjectId(award.divisionId)
  }));
  db.addAwards(awards).then(awards => {
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
  '/winners',
  asyncHandler(async (req: Request, res: Response) => {
    const body = req.body as Record<AwardNames, Array<WithId<Team> | string>>;
    let awards = await db.getDivisionAwards(new ObjectId(req.params.divisionId));
    if (!Object.keys(body).every(awardName => awards.some(award => award.name === awardName))) {
      res.status(400).json({ error: 'Invalid award name' });
      return;
    }

    if (
      !Object.entries(body).every(
        ([awardName, winners]) => winners.length === awards.filter(a => a.name === awardName).length
      )
    ) {
      res.status(400).json({ error: 'Invalid number of winners' });
      return;
    }

    const newAwards = [];
    Object.entries(body).forEach(([awardName, winners]) => {
      const updatedAward = [...awards].filter(a => a.name === awardName);
      updatedAward
        .sort((a, b) => a.place - b.place)
        .forEach((award, index) => newAwards.push({ ...award, winner: winners[index] }));
    });

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
