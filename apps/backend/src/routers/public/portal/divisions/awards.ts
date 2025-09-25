import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { PortalAward, PortalTeam } from '@lems/types';

import divisionCompleted from '../../../../middlewares/old-portal/division-completed';

const router = express.Router({ mergeParams: true });

router.get('/', divisionCompleted, async (req: Request, res: Response) => {
  const awards = await db.getDivisionAwards(new ObjectId(req.division._id));
  const result: (PortalAward & { index: number })[] = awards.map(award => {
    const { name, place, index } = award;
    if (!award.winner) return { name, place, index };

    let winner: PortalTeam | string | undefined;
    if (typeof award.winner === 'string') {
      winner = award.winner;
    } else {
      const { _id, number, name, affiliation } = award.winner;
      winner = { id: String(_id), number, name, affiliation };
    }

    return { name, place, winner, index };
  });

  result.sort((a, b) => {
    if (a.index !== b.index) {
      return b.index - a.index;
    }
    return a.place - b.place;
  });

  res.json(result);
});

export default router;
