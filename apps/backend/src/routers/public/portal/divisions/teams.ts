import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { PortalAward, PortalTeam } from '@lems/types';
import teamValidator from '../../../../middlewares/portal/team-validator';
import divisionCompleted from '../../../../middlewares/portal/division-completed';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const teams = await db.getDivisionTeams(new ObjectId(req.params.divisionId));
    const result: Array<PortalTeam> = teams.map(team => {
      const { _id, number, name, affiliation } = team;
      return { id: String(_id), number, name, affiliation };
    });

    res.json(result);
  })
);

router.use('/teamNumber', teamValidator);

router.get(
  '/:teamNumber',
  asyncHandler(async (req: Request, res: Response) => {
    const team = await db.getTeam({
      divisionId: new ObjectId(req.params.divisionId),
      number: Number(req.params.teamNumber)
    });

    if (!team) {
      res.status(404).send('Team not found');
      return;
    }

    const { _id, number, name, affiliation } = team;
    res.json({ id: String(_id), number, name, affiliation });
  })
);

router.get('/:teamNumber/schedule', (req: Request, res: Response) => {
  // get team schedule
});

router.get(
  '/:teamNumber/awards',
  divisionCompleted,
  asyncHandler(async (req: Request, res: Response) => {
    const awards = await db.getTeamAwards(new ObjectId(req.team._id));
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
