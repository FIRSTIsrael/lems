import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { ObjectId } from 'mongodb';
import { FllEvent, Role } from '@lems/types';
import * as db from '@lems/database';
import { randomString } from '@lems/utils/random';

const router = express.Router({ mergeParams: true });

router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { divisions, eventUsers, ...body }: any = { ...req.body };
    if (!body) {
      res.status(400).json({ ok: false });
      return;
    }

    body.startDate = new Date(body.startDate);
    body.endDate = new Date(body.endDate);

    console.log('⏬ Creating Event...');
    const eventResult = await db.addFllEvent(body);
    if (!eventResult.acknowledged) {
      console.log(`❌ Could not create Event ${body.name}`);
      res.status(500).json({ ok: false });
      return;
    }

    console.log('⏬ Creating Event divisions...');
    divisions.forEach(async division => {
      const divisionResult = await db.addDivision({
        ...division,
        eventId: eventResult.insertedId,
        hasState: false
      });
      if (divisionResult.acknowledged) {
        console.log(`✅ Division ${divisionResult.insertedId} created!`);
      } else {
        console.log(`❌ Could not create division ${division.name}`);
        res.status(500).json({ ok: false });
        return;
      }
    });

    console.log('⏬ Creating event users...');
    const users = Object.entries(eventUsers).map(([role, enabled]: [Role, boolean]) => {
      if (!enabled) return;
      return {
        role,
        isAdmin: false,
        eventId: eventResult.insertedId,
        password: randomString(4),
        lastPasswordSetDate: new Date()
      };
    });
    const userResult = await db.addUsers(users);
    if (userResult.acknowledged) {
      console.log(`✅ Event users created!`);
    } else {
      console.log(`❌ Could not create event users for ${eventResult.insertedId}`);
      res.status(500).json({ ok: false });
      return;
    }

    res.json({ ok: true, id: eventResult.insertedId });
  })
);

router.put('/:eventId', (req: Request, res: Response) => {
  const body: Partial<FllEvent> = { ...req.body };
  if (!body) return res.status(400).json({ ok: false });

  if (body.startDate) body.startDate = new Date(body.startDate);
  if (body.endDate) body.endDate = new Date(body.endDate);

  console.log(`⏬ Updating Event ${req.params.eventId}`);
  db.updateFllEvent({ _id: new ObjectId(req.params.eventId) }, body, true).then(task => {
    if (task.acknowledged) {
      console.log('✅ Event updated!');
      return res.json({ ok: true, id: task.upsertedId });
    } else {
      console.log('❌ Could not update Event');
      return res.status(500).json({ ok: false });
    }
  });
});

export default router;
