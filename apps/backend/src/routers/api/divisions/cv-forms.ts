import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    res.json(await db.getDivisionCoreValuesForms(new ObjectId(req.params.divisionId)));
  })
);

router.get(
  '/:cvFormId',
  asyncHandler(async (req: Request, res: Response) => {
    res.json(
      await db.getCoreValuesForm({
        _id: new ObjectId(req.params.cvFormId)
      })
    );
  })
);

export default router;
