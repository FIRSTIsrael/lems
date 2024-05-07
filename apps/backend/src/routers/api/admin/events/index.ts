import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import { Division } from '@lems/types';
import * as db from '@lems/database';
import divisionScheduleRouter from './schedule';
import divisionUsersRouter from './users';
import divisionAwardsRouter from './awards';
import divisionPitMapRouter from './pit-map';
import { cleanDivisionData } from '../../../../lib/schedule/cleaner';

const router = express.Router({ mergeParams: true });

router.post('/', (req: Request, res: Response) => {
  const body: Division = { ...req.body };
  if (!body) return res.status(400).json({ ok: false });

  body.startDate = new Date(body.startDate);
  body.endDate = new Date(body.endDate);

  console.log('⏬ Creating Division...');
  db.addDivision(body).then(task => {
    if (task.acknowledged) {
      console.log('✅ Division created!');
      return res.json({ ok: true, id: task.insertedId });
    } else {
      console.log('❌ Could not create Division');
      return res.status(500).json({ ok: false });
    }
  });
});

router.put('/:divisionId', (req: Request, res: Response) => {
  const body: Partial<Division> = { ...req.body };
  if (!body) return res.status(400).json({ ok: false });

  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);

  if (body.schedule)
    body.schedule = body.schedule.map(e => {
      return { ...e, startTime: new Date(e.startTime), endTime: new Date(e.endTime) };
    });

  console.log(`⏬ Updating Division ${req.params.divisionId}`);
  db.updateDivision({ _id: new ObjectId(req.params.divisionId) }, body, true).then(task => {
    if (task.acknowledged) {
      console.log('✅ Division updated!');
      return res.json({ ok: true, id: task.upsertedId });
    } else {
      console.log('❌ Could not update Division');
      return res.status(500).json({ ok: false });
    }
  });
});

router.delete(
  '/:divisionId/data',
  asyncHandler(async (req: Request, res: Response) => {
    const division = await db.getDivision({ _id: new ObjectId(req.params.divisionId) });

    console.log(`🚮 Deleting data from division ${req.params.divisionId}`);
    try {
      await cleanDivisionData(division);
      await db.updateDivision({ _id: division._id }, { hasState: false });
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
