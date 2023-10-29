import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { CoreValuesForm } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get('/', async (req: Request, res: Response) => {
  res.json(await db.getEventCoreValuesForms(new ObjectId(req.params.eventId)));
});

router.post('/', async (req: Request, res: Response) => {
  const body: CoreValuesForm = { ...req.body };
  if (!body) return res.status(400).json({ ok: false });

  body.eventId = new ObjectId(body.eventId);

  db.addCoreValuesForm(body).then(task => {
    if (task.acknowledged) {
      console.log('✅ CV Form created!');
      return res.json({ ok: true, id: task.insertedId });
    } else {
      console.log('❌ Could not create CV Form');
      return res.status(500).json({ ok: false });
    }
  });
});

export default router;
