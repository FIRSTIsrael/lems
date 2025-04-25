import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';

import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  res.json(await db.getDivisionTickets(new ObjectId(req.params.divisionId)));
});

export default router;
