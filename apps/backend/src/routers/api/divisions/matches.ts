import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { ObjectId } from 'mongodb';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await db.getDivisionMatches(req.params.divisionId));
  })
);

router.get(
  '/:matchId',
  asyncHandler(async (req: Request, res: Response) => {
    res.json(
      await db.getMatch({
        _id: new ObjectId(req.params.matchId)
      })
    );
  })
);

export default router;
