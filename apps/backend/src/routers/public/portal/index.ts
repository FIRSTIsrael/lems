import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/events', (req: Request, res: Response) => {
  // get all events (For homepage)
});

export default router;
