import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { JudgingCategory, JudgingCategoryTypes, JudgingDeliberation } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const deliberations = await db.getJudgingDeliberationsFromDivision(
      new ObjectId(req.params.divisionId)
    );
    res.json(deliberations);
  })
);

router.get(
  '/:judgingCategory',
  asyncHandler(async (req: Request, res: Response) => {
    if (!JudgingCategoryTypes.includes(req.params?.judgingCategory as JudgingCategory)) {
      res.status(400).json({ error: 'Invalid judging category' });
      return;
    }

    const deliberation = await db.getJudgingDeliberation({
      divisionId: new ObjectId(req.params.divisionId),
      category: req.params.judgingCategory as JudgingCategory
    });

    res.json(deliberation);
  })
);

router.get(
  '/final',
  asyncHandler(async (req: Request, res: Response) => {
    const deliberation = await db.getJudgingDeliberation({
      divisionId: new ObjectId(req.params.divisionId),
      isFinalDeliberation: true
    });

    res.json(deliberation);
  })
);

router.put(
  '/:deliberationId',
  asyncHandler(async (req: Request, res: Response) => {
    const body: Partial<JudgingDeliberation> = { ...req.body };
    if (!body) {
      res.status(400).json({ ok: false });
      return;
    }

    console.log(`⏬ Updating Deliberation ${req.params.deliberationId}`);
    const task = await db.updateJudgingDeliberation(
      { _id: new ObjectId(req.params.deliberationId) },
      body
    );

    if (task.modifiedCount === 1) {
      console.log('✅ Deliberation updated!');
      res.json({ ok: true, id: task.upsertedId });
      return;
    }
    console.log('❌ Could not update Deliberation');
    res.status(500).json({ ok: false });
  })
);

export default router;
