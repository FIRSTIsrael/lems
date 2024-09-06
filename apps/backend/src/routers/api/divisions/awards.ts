import express, { Request, Response } from 'express';
import { WithId, ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import { Award, Team } from '@lems/types';
import * as db from '@lems/database';

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
  '/winners',
  asyncHandler(async (req: Request, res: Response) => {
    const newAwards: Array<WithId<Award>> = req.body.awards;
    const advancingTeams: Array<WithId<Team>> = req.body.advancingTeams;

    newAwards.forEach(award => {
      award._id = new ObjectId(award._id);
      if (typeof award.winner === 'string' || !award.winner) return;
      award.winner._id = new ObjectId(award.winner?._id);
      award.winner.divisionId = new ObjectId(award.winner?.divisionId);
    });

    advancingTeams.forEach(team => {
      team._id = new ObjectId(team._id);
    });

    await Promise.all(
      newAwards.map(async (award: WithId<Award>) => {
        if (!(await db.updateAward({ _id: award._id }, { winner: award.winner })).acknowledged)
          return res.status(500).json({ ok: false });
      })
    );

    await Promise.all(
      advancingTeams.map(async (team: WithId<Team>) => {
        if (!(await db.updateTeam({ _id: team._id }, { advancing: true })).acknowledged)
          return res.status(500).json({ ok: false });
      })
    );

    res.json({ ok: true });
  })
);

export default router;
