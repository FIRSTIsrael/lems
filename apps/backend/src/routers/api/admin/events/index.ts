import express, { Request, Response } from 'express';
import eventScheduleRouter from './schedule';
import { Event } from '@lems/types';
import * as db from '@lems/database';

const router = express.Router({ mergeParams: true });

router.post('/', (req: Request, res: Response) => {
  const body: Event = { ...req.body };

  //TODO: nice syntax for this in the destructuring
  body.startDate = new Date(body.startDate);
  body.endDate = new Date(body.endDate);

  if (body) {
    console.log('⏬ Creating Event...');
    db.addEvent(body)
      .then(task => {
        if (task.acknowledged) {
          console.log('✅ Event created!');
          return res.json({ ok: true, id: task.insertedId });
        } else {
          console.log('❌ Could not create Event');
          return res.status(500).json({ ok: false });
        }
      });
  } else {
    return res.status(400).json({ ok: false });
  }
});

router.use('/:eventId/schedule', eventScheduleRouter);

export default router;
