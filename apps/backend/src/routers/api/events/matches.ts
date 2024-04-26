import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { ObjectId } from 'mongodb';
import { RoleTypes } from '@lems/types';
import roleValidator from '../../../middlewares/role-validator';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  roleValidator([...RoleTypes]),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await db.getEventMatches(req.params.eventId));
  })
);

router.get(
  '/:matchId',
  roleValidator('referee'),
  asyncHandler(async (req: Request, res: Response) => {
    res.json(
      await db.getMatch({
        _id: new ObjectId(req.params.matchId)
      })
    );
  })
);

export default router;
