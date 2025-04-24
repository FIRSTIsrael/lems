import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';

import { Division } from '@lems/types';
import * as db from '@lems/database';
import divisionScheduleRouter from './schedule';
import divisionUsersRouter from './users';
import divisionAwardsRouter from './awards';
import divisionPitMapRouter from './pit-map';
import divisionTeamListRouter from './team-list';
import { cleanDivisionData } from '../../../../lib/schedule/cleaner';

const router = express.Router({ mergeParams: true });

router.put('/:divisionId', (req: Request, res: Response) => {
  const body: Partial<Division> = { ...req.body };
  if (!body) {
    res.status(400).json({ ok: false });
    return;
  }

  if (body.schedule)
    body.schedule = body.schedule.map(e => {
      return { ...e, startTime: new Date(e.startTime), endTime: new Date(e.endTime) };
    });

  console.log(`⏬ Updating Division ${req.params.divisionId}`);
  db.updateDivision({ _id: new ObjectId(req.params.divisionId) }, body, true).then(task => {
    if (task.acknowledged) {
      console.log('✅ Division updated!');
      res.json({ ok: true, id: task.upsertedId });
    } else {
      console.log('❌ Could not update Division');
      res.status(500).json({ ok: false });
    }
  });
});

router.delete('/:divisionId/data', async (req: Request, res: Response) => {
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
});

router.use('/:divisionId/schedule', divisionScheduleRouter);
router.use('/:divisionId/pit-map', divisionPitMapRouter);
router.use('/:divisionId/team-list', divisionTeamListRouter);
router.use('/:divisionId/users', divisionUsersRouter);
router.use('/:divisionId/awards', divisionAwardsRouter);

export default router;
