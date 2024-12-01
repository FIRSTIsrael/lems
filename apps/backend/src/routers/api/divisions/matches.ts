import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await db.getDivisionMatches(req.params.divisionId));
  })
);

export default router;
