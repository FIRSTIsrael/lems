import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import { Event } from '@lems/types';
import * as db from '@lems/database';
import divisionScheduleRouter from './schedule';
import divisionUsersRouter from './users';
import divisionAwardsRouter from './awards';
import divisionPitMapRouter from './pit-map';
import { cleanEventData } from '../../../../lib/schedule/cleaner';

const router = express.Router({ mergeParams: true });

router.post('/', (req: Request, res: Response) => {
  const body: Event = { ...req.body };
  if (!body) return res.status(400).json({ ok: false });

  body.startDate = new Date(body.startDate);
  body.endDate = new Date(body.endDate);

  console.log('⏬ Creating Event...');
  db.addEvent(body).then(task => {
    if (task.acknowledged) {
      console.log('✅ Event created!');
      return res.json({ ok: true, id: task.insertedId });
    } else {
      console.log('❌ Could not create Event');
      return res.status(500).json({ ok: false });
    }
  });
});

router.put('/:divisionId', (req: Request, res: Response) => {
  const body: Partial<Event> = { ...req.body };
  if (!body) return res.status(400).json({ ok: false });

  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);

  if (body.schedule)
    body.schedule = body.schedule.map(e => {
      return { ...e, startTime: new Date(e.startTime), endTime: new Date(e.endTime) };
    });

  console.log(`⏬ Updating Event ${req.params.divisionId}`);
  db.updateEvent({ _id: new ObjectId(req.params.divisionId) }, body, true).then(task => {
    if (task.acknowledged) {
      console.log('✅ Event updated!');
      return res.json({ ok: true, id: task.upsertedId });
    } else {
      console.log('❌ Could not update Event');
      return res.status(500).json({ ok: false });
    }
  });
});

router.delete(
  '/:divisionId/data',
  asyncHandler(async (req: Request, res: Response) => {
    const division = await db.getEvent({ _id: new ObjectId(req.params.divisionId) });

    console.log(`🚮 Deleting data from division ${req.params.divisionId}`);
    try {
      await cleanEventData(division);
      await db.updateEvent({ _id: division._id }, { hasState: false });
    } catch (error) {
      res.status(500).json(error.message);
      return;
    }
    console.log('✅ Deleted division data!');
    res.status(200).json({ ok: true });
  })
);

router.use('/:divisionId/schedule', divisionScheduleRouter);
router.use('/:divisionId/pit-map', divisionPitMapRouter);
router.use('/:divisionId/users', divisionUsersRouter);
router.use('/:divisionId/awards', divisionAwardsRouter);

export default router;
