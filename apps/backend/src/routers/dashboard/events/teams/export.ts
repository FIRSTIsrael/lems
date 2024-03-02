import { ObjectId } from 'mongodb';
import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { getLemsWebpageAsPdf } from '../../../../lib/export';

const router = express.Router({ mergeParams: true });

router.get(
  '/rubrics',
  asyncHandler(async (req: Request, res: Response) => {
    const team = await db.getTeam({
      eventId: new ObjectId(req.event._id),
      number: Number(req.teamNumber)
    });
    if (!team) {
      res.status(400).json({ error: 'BAD_REQUEST' });
      return;
    }

    const pdf = await getLemsWebpageAsPdf(`/event/${team.eventId}/export/${team._id}/rubrics`);

    res.contentType('application/pdf');
    res.send(pdf);
  })
);

router.get(
  '/scoresheets',
  asyncHandler(async (req: Request, res: Response) => {
    const team = await db.getTeam({
      eventId: new ObjectId(req.event._id),
      number: Number(req.teamNumber)
    });
    if (!team) {
      res.status(400).json({ error: 'BAD_REQUEST' });
      return;
    }

    const pdf = await getLemsWebpageAsPdf(`/event/${team.eventId}/export/${team._id}/scoresheets`);

    res.contentType('application/pdf');
    res.send(pdf);
  })
);

router.get(
  '/awards',
  asyncHandler(async (req: Request, res: Response) => {
    res.status(501).json({ error: 'NOT IMPLEMENTED' });
  })
);

export default router;
