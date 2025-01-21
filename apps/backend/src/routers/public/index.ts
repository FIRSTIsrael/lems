import express, { Request, Response } from 'express';
import * as db from '@lems/database';
import divisionsRouter from './divisions';
import portalRouter from './portal';

const router = express.Router({ mergeParams: true });

router.get('/events', (req: Request, res: Response) => {
  db.getAllFllEvents().then(events => {
    res.json(
      events.map(event => {
        event.divisions.forEach(division => {
          delete division.schedule;
          return division;
        });
        return event;
      })
    );
  });
});

router.use('/divisions', divisionsRouter);

router.use('/portal', portalRouter);

export default router;
