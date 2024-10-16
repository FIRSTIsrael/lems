import express, { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { AwardNameTypes, AwardSchema, AwardNames } from '@lems/types';

const router = express.Router({ mergeParams: true });

router.get(
  '/schema',
  asyncHandler(async (req: Request, res: Response) => {
    const awards = await db.getDivisionAwards(new ObjectId(req.params.divisionId));
    const schema = Object.fromEntries(AwardNameTypes.map(a => [a, undefined]));

    awards.forEach(award => {
      if (award.index >= 0) {
        // Non-display awards get index -1
        let count = schema[award.name]?.count;
        if (!count || count < award.place) count = award.place;
        schema[award.name] = { index: award.index, count };
      }
    });

    res.json(schema);
  })
);

router.post(
  '/schema',
  asyncHandler(async (req: Request, res: Response) => {
    const schema: AwardSchema = req.body;
    const awards = await db.getDivisionAwards(new ObjectId(req.params.divisionId));

    await Promise.all(
      Object.entries(schema).map(([name, { index: awardIndex, count: totalAwardPlaces }]) => {
        const existingAwards = awards.filter(a => a.name === name);

        existingAwards.forEach(award => {
          if (award.place > totalAwardPlaces) db.deleteAwards({ _id: award._id });
        });

        const promises = [];
        for (let i = 1; i <= totalAwardPlaces; i++) {
          promises.push(
            db.updateAward(
              {
                divisionId: new ObjectId(req.params.divisionId),
                name: name as AwardNames,
                place: i
              },
              {
                divisionId: new ObjectId(req.params.divisionId),
                index: awardIndex,
                name: name as AwardNames,
                place: i
              },
              true
            )
          );
        }
        return Promise.all(promises);
      })
    );

    res.json({ ok: true });
  })
);

export default router;
