import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import fileUpload from 'express-fileupload';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.post(
  '/team-info',
  fileUpload(),
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ error: 'NOT IMPLEMENTED' });
  })
);

router.get(
  '/robot-design-notebook',
  fileUpload(),
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ error: 'NOT IMPLEMENTED' });
  })
);
export default router;
