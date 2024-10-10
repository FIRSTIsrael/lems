import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { JudgingCategory, JudgingCategoryTypes } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const rubrics = await db.getDivisionRubrics(new ObjectId(req.params.divisionId));
    res.json(rubrics);
  })
);

router.get(
  '/:judgingCategory',
  asyncHandler(async (req: Request, res: Response) => {
    if (!JudgingCategoryTypes.includes(req.params?.judgingCategory as JudgingCategory)) {
      res.status(400).json({ error: 'Invalid judging category' });
      return;
    }

    const rubrics = await db.getDivisionRubricsFromCategory(
      new ObjectId(req.params.divisionId),
      req.params.judgingCategory as JudgingCategory
    );

    res.json(rubrics);
  })
);

export default router;
