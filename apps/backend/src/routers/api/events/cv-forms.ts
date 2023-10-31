import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  res.json(await db.getEventCoreValuesForms(new ObjectId(req.params.eventId)));
});

router.get('/:cvFormId', async (req: Request, res: Response) => {
  res.json(
    await db.getCoreValuesForm({
      _id: new ObjectId(req.params.cvFormId)
    })
  );
});

export default router;
