import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { JudgingSession, RobotGameMatch } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  // get event outline
});

router.get(
  '/judging',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [{ $match: { divisionId: new ObjectId(req.division._id) } }];

    const schedule = await db.db
      .collection<JudgingSession>('sessions')
      .aggregate(pipeline)
      .toArray();

    res.json(schedule);
  })
);

router.get(
  '/field',
  asyncHandler(async (req: Request, res: Response) => {
    const pipeline = [{ $match: { divisionId: new ObjectId(req.division._id) } }];

    const schedule = await db.db
      .collection<RobotGameMatch>('matches')
      .aggregate(pipeline)
      .toArray();

    res.json(schedule);
  })
);

export default router;
