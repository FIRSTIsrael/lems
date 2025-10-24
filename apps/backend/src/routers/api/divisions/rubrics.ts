import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { JudgingCategory, JudgingCategoryTypes } from '@lems/types';
import { makeCvValuesForAllRubrics } from '@lems/season';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  let rubrics = await db.getDivisionRubrics(new ObjectId(req.params.divisionId));
  if (req.query.makeCvValues) {
    rubrics = makeCvValuesForAllRubrics(rubrics);
  }
  res.json(rubrics);
});

router.get('/:judgingCategory', async (req: Request, res: Response) => {
  if (!JudgingCategoryTypes.includes(req.params?.judgingCategory as JudgingCategory)) {
    res.status(400).json({ error: 'Invalid judging category' });
    return;
  }

  const rubrics = await db.getDivisionRubricsFromCategory(
    new ObjectId(req.params.divisionId),
    req.params.judgingCategory as JudgingCategory
  );

  res.json(rubrics);
});

export default router;
