import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { PortalActivity, PortalAward, PortalTeam } from '@lems/types';
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

router.use('/:teamNumber', teamValidator);

router.get(
  '/:teamNumber',
  asyncHandler(async (req: Request, res: Response) => {
    const { _id, number, name, affiliation } = req.team;
    res.json({ id: String(_id), number, name, affiliation });
  })
);

router.get(
  '/:teamNumber/schedule',
  asyncHandler(async (req: Request, res: Response) => {
    const teamMatches = await db
      .findMatches({
        'participants.teamId': new ObjectId(req.team._id)
      })
      .toArray();

    const matches: Array<PortalActivity<'match'>> = [];
    for (const match of teamMatches) {
      const { stage, round, number, scheduledTime } = match;

      // Not null since we're filtering by teamId
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const tableId = match.participants.find(participant =>
        participant.teamId?.equals(req.team._id)
      )!.tableId;

      const table = (await db.getTable({ _id: tableId })).name;

      matches.push({ type: 'match', stage, round, number, table, time: scheduledTime });
    }

    const teamSession = await db.getSession({ teamId: new ObjectId(req.team._id) });
    const { number, scheduledTime } = teamSession;
    const room = (await db.getRoom({ _id: teamSession.roomId })).name;
    const session: PortalActivity<'session'> = {
      type: 'session',
      number,
      room,
      time: scheduledTime
    };

    const generalActivities: Array<PortalActivity<'general'>> = (req.division.schedule ?? []).map(
      ({ name, startTime }) => ({ type: 'general', name, time: startTime })
    );

    const result: Array<PortalActivity<'match' | 'session' | 'general'>> = [
      ...matches,
      session,
      ...generalActivities
    ];

    res.json(result);
  })
);

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
