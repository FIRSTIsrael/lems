import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { PortalActivity } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  const generalActivities: Array<PortalActivity<'general'>> = (req.division.schedule ?? []).map(
    ({ name, startTime }) => ({ type: 'general', name, time: startTime })
  );
  res.json(generalActivities);
});

// Incomplete!
// TODO: return a tabular structure. Do not return activity types as they are team specific
router.get(
  '/judging',
  asyncHandler(async (req: Request, res: Response) => {
    const sessions = await db.getDivisionSessions(new ObjectId(req.division._id));

    const result: Array<PortalActivity<'session'>> = [];
    for (const session of sessions) {
      const { number, status, scheduledTime, roomId } = session;
      const room = (await db.getRoom({ _id: roomId })).name;
      result.push({
        type: 'session',
        number,
        status,
        time: scheduledTime,
        room
      });
    }

    res.json(result);
  })
);

// Incomplete!
// TODO: return a tabular structure. Do not return activity types as they are team specific
router.get(
  '/field',
  asyncHandler(async (req: Request, res: Response) => {
    const matches = await db.getDivisionMatches(req.division._id);

    const result: Array<PortalActivity<'match'>> = [];
    for (const match of matches) {
      const { status, stage, round, number, scheduledTime } = match;
      const table = (await db.getTable({ _id: match.participants[0].tableId })).name;
      result.push({ type: 'match', status, stage, round, number, table, time: scheduledTime });
    }

    res.json(result);
  })
);

export default router;
