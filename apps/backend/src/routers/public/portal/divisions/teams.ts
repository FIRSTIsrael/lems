import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  // get division teans
});

router.get('/:teamNumber', (req: Request, res: Response) => {
  // get team information
});

router.get('/:teamNumber/schedule', (req: Request, res: Response) => {
  // get team schedule
});

router.get('/:teamNumber/awards', (req: Request, res: Response) => {
  // get team awards
});

export default router;
