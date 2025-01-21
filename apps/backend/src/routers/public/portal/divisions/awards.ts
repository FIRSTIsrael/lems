import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { PortalAward, PortalTeam } from '@lems/types';
import asyncHandler from 'express-async-handler';
import divisionCompleted from '../../../../middlewares/portal/division-completed';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  divisionCompleted,
  asyncHandler(async (req: Request, res: Response) => {
    const awards = await db.getDivisionAwards(new ObjectId(req.division._id));
    const result: Array<PortalAward> = awards.map(award => {
      const { name, place } = award;

      let winner: PortalTeam | string | undefined;
      if (typeof award.winner === 'string') {
        winner = award.winner;
      } else {
        const { _id, number, name, affiliation } = award.winner;
        winner = { id: String(_id), number, name, affiliation };
      }

      return { name, place, winner };
    });

    res.json(result);
  })
);

export default router;
