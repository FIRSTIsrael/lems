import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const rubrics = await db.getDivisionRubrics(new ObjectId(req.params.divisionId));
    res.json(rubrics);
  })
);

export default router;
