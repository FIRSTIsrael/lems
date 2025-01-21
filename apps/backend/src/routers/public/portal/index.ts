import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { PortalEvent } from '@lems/types';
import divisionsRouter from './divisions/index';

const router = express.Router({ mergeParams: true });

router.get(
  '/events',
  asyncHandler(async (req: Request, res: Response) => {
    const events = await db.getAllFllEvents();

    const result: Array<PortalEvent> = events.map(event => {
      const { enableDivisions, divisions, startDate } = event;

      if (!(divisions?.length > 0)) {
        return null; // Impossible, should never happen
      }

      if (!divisions[0].hasState) {
        return null; // Event not initialized.
      }

      if (!enableDivisions) {
        const { _id, name, color } = divisions[0];
        return { id: String(_id), name, date: startDate, color };
      }

      const { _id, name, color } = event;
      const eventDivisions = divisions.map(({ _id, name, color }) => ({
        id: String(_id),
        name,
        color
      }));
      return { id: String(_id), name, date: startDate, color: color, divisions: eventDivisions };
    });

    res.json(result.filter(event => event !== null));
  })
);

router.use('/events/:divisionId', divisionsRouter);

export default router;
