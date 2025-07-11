import express, { Request, Response } from 'express';
import { WithId, ObjectId } from 'mongodb';
import * as db from '@lems/database';

import { Award, Team, AwardNames } from '@lems/types';
import roleValidator from '../../../middlewares/lems/role-validator';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  roleValidator(['judge-advisor', 'mc', 'scorekeeper', 'audience-display']),
  (req: Request, res: Response) => {
    db.getDivisionAwards(new ObjectId(req.params.divisionId)).then(awards => {
      res.json(awards);
    });
  }
);

router.post('/', roleValidator(['judge-advisor']), (req: Request, res: Response) => {
  const awards = req.body.map((award: Award) => {
    if (award.winner && typeof award.winner !== 'string') {
      award.winner._id = new ObjectId(award.winner._id);
    }

    return {
      ...award,
      divisionId: new ObjectId(award.divisionId)
    };
  });

  db.addAwards(awards).then(awards => {
    res.json(awards);
  });
});

router.get('/schema', (req: Request, res: Response) => {
  db.getDivisionAwards(new ObjectId(req.params.divisionId)).then(awards => {
    res.json(
      awards.map(award => {
        const { winner, ...rest } = award;
        return rest;
      })
    );
  });
});

router.get(
  '/:awardId',
  roleValidator(['judge-advisor', 'mc', 'scorekeeper', 'audience-display']),
  (req: Request, res: Response) => {
    db.getAward({
      _id: new ObjectId(req.params.awardId),
      divisionId: new ObjectId(req.params.divisionId)
    }).then(award => {
      res.json(award);
    });
  }
);

router.put('/winners', roleValidator(['judge-advisor']), async (req: Request, res: Response) => {
  const body = req.body as Record<AwardNames, Array<WithId<Team> | string>>;
  const awards = await db.getDivisionAwards(new ObjectId(req.params.divisionId));
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
      .forEach((award, index) => {
        const winner = winners[index];
        if (typeof winner !== 'string') {
          winner._id = new ObjectId(winner._id);
        }
        newAwards.push({ ...award, winner });
      });
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
