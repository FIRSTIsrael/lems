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

router.put('/:deliberationId', (req: Request, res: Response) => {
  const body: Partial<JudgingDeliberation> = { ...req.body };
  if (!body) return res.status(400).json({ ok: false });

  console.log(`⏬ Updating Deliberation for deliberation ${req.params.deliberationId}`);
  db.updateJudgingDeliberation({ _id: new ObjectId(req.params.divisionId) }, body).then(task => {
    if (task.acknowledged) {
      console.log('✅ Deliberation updated!');
      return res.json({ ok: true, id: task.upsertedId });
    } else {
      console.log('❌ Could not update Deliberation');
      return res.status(500).json({ ok: false });
    }
  });
});

export default router;
