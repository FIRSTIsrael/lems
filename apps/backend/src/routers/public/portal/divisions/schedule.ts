import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', (req: Request, res: Response) => {
  // get event outline
});

router.get('/judging', (req: Request, res: Response) => {
  // get judging schedule
});

router.get('/field', (req: Request, res: Response) => {
  // get field schedule
});

export default router;
