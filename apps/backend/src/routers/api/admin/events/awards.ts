import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import * as db from '@lems/database';
import { AwardNameTypes, AwardSchema, AwardNames } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get('/schema', async (req: Request, res: Response) => {
  const awards = await db.getEventAwards(new ObjectId(req.params.eventId));
  const schema = Object.fromEntries(AwardNameTypes.map(a => [a, undefined]));

  awards.forEach(award => {
    let count = schema[award.name]?.count;
    if (!count || count < award.place) count = award.place;
    schema[award.name] = { index: award.index, count };
  });

  res.json(schema);
});

router.post('/schema', async (req: Request, res: Response) => {
  const schema: AwardSchema = req.body;
  const awards = await db.getEventAwards(new ObjectId(req.params.eventId));

  Object.entries(schema).forEach(([name, { index, count }]) => {
    const existingAwards = awards.filter(a => a.name === name);

    existingAwards.forEach(award => {
      if (award.place > count) db.deleteAwards({ _id: award._id });
    });

    for (let i = 1; i <= count; i++) {
      db.updateAward(
        { eventId: new ObjectId(req.params.eventId), name: name as AwardNames, place: i },
        {
          eventId: new ObjectId(req.params.eventId),
          index,
          name: name as AwardNames,
          place: i
        },
        true
      );
    }
  });

  res.json({ ok: true });
});

export default router;
