import express, { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import * as db from '@lems/database';
import { PortalEvent } from '@lems/types';
import divisionsRouter from './divisions/index';
import { cache } from '../../../middlewares/cache';

const router = express.Router({ mergeParams: true });

router.use('/', cache(60));

router.get(
  '/events',
  asyncHandler(async (req: Request, res: Response) => {
    const events = await db.getAllFllEvents();

    const result: Array<PortalEvent> = events.map(event => {
      const { enableDivisions, divisions, startDate, location } = event;

      if (!(divisions?.length > 0)) {
        return null; // Impossible, should never happen
      }

      if (!divisions[0].hasState) {
        return null; // Event not initialized.
      }

      if (!enableDivisions) {
        const { _id, name, color, routing } = divisions[0];
        return { id: String(_id), name, date: startDate, color, location, routing };
      }

      const { _id, name, color, routing } = event;
      const eventDivisions = divisions
        .map(({ _id, name, color, hasState }) => {
          if (!hasState) return null;
          return { id: String(_id), name, color, routing };
        })
        .filter(division => division !== null);
      return { id: String(_id), name, date: startDate, color, location, divisions: eventDivisions, routing };
    });

    res.json(result.filter(event => event !== null));
  })
);

router.use('/events/:divisionId', divisionsRouter);

export default router;
