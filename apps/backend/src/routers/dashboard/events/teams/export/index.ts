import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import rubrics from './rubrics';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get(
  '/rubrics',
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ error: 'NOT IMPLEMENTED' });
  })
);

router.get(
  '/scoresheets',
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ error: 'NOT IMPLEMENTED' });
  })
);

router.get(
  '/awards',
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ error: 'NOT IMPLEMENTED' });
  })
);

export default router;
